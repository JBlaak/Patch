package nl.jblaak.patch.internal

import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.PointerInputScope
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import nl.jblaak.patch.Fling
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.tanh

private class SpringConfig(val stiffness: Float, val damping: Float)

private class Spring {
    var value = 0f
    var velocity = 0f

    fun step(target: Float, config: SpringConfig, dt: Float) {
        val force = -config.stiffness * (value - target) - config.damping * velocity
        velocity += force * dt
        value += velocity * dt
    }

    fun settle() {
        value = 0f
        velocity = 0f
    }
}

private class Sample(val millis: Long, val x: Float, val y: Float)

/** Held: stiff enough to keep up, soft enough to read as being carried. */
private val Follow = SpringConfig(stiffness = 700f, damping = 38f)

/** Let go: underdamped, so the way home overshoots and wobbles. */
private val Return = SpringConfig(stiffness = 170f, damping = 9f)
private val Tilt = SpringConfig(stiffness = 260f, damping = 14f)

/**
 * Picking Patch up and letting go, in dp. While held, Patch trails the finger on a stiff spring and the leash stretches:
 * the further it is pulled the less it follows. It tilts with its sideways speed and stretches with speed. Let go, it
 * springs home on a looser spring that overshoots and wobbles.
 */
@Stable
internal class DragState(private val scope: CoroutineScope) {

    private val x = Spring()
    private val y = Spring()
    private val tilt = Spring()
    private val stretch = Spring()
    private var targetX = 0f
    private var targetY = 0f
    private var samples = mutableListOf<Sample>()
    private var frames: Job? = null

    var held: Boolean by mutableStateOf(false)
        private set
    var pressed: Boolean by mutableStateOf(false)
        private set

    var offsetX: Float by mutableFloatStateOf(0f)
        private set
    var offsetY: Float by mutableFloatStateOf(0f)
        private set
    var rotation: Float by mutableFloatStateOf(0f)
        private set
    var stretched: Float by mutableFloatStateOf(0f)
        private set

    suspend fun PointerInputScope.handle(
        still: () -> Boolean,
        onPoke: (() -> Unit)?,
        onGrab: (() -> Unit)?,
        onDrop: ((Fling) -> Unit)?,
    ) {
        awaitEachGesture {
            val down = awaitFirstDown()
            pressed = true
            val startX = down.position.x.toDp().value - x.value
            val startY = down.position.y.toDp().value - y.value
            samples = mutableListOf(Sample(down.uptimeMillis, down.position.x.toDp().value, down.position.y.toDp().value))
            var dropped = false
            var releasedAt = down.uptimeMillis
            while (true) {
                val event = awaitPointerEvent()
                val change = event.changes.firstOrNull { it.id == down.id } ?: break
                releasedAt = change.uptimeMillis
                if (!change.pressed) {
                    dropped = true
                    change.consume()
                    break
                }
                val fingerX = change.position.x.toDp().value
                val fingerY = change.position.y.toDp().value
                val dx = fingerX - startX
                val dy = fingerY - startY
                if (!held) {
                    if (hypot(dx - x.value, dy - y.value) < 4f) continue
                    held = true
                    onGrab?.invoke()
                }
                if (change.positionChange() != Offset.Zero) change.consume()
                samples.add(Sample(change.uptimeMillis, fingerX, fingerY))
                if (samples.size > 12) samples.removeAt(0)
                leash(dx, dy)
                if (still()) {
                    x.value = targetX
                    y.value = targetY
                    paint()
                } else {
                    run(still)
                }
            }
            pressed = false
            val wasHeld = held
            if (!wasHeld) {
                if (dropped) onPoke?.invoke()
                return@awaitEachGesture
            }
            release(dropped, releasedAt, still, onDrop)
        }
    }

    private fun release(dropped: Boolean, releasedAt: Long, still: () -> Boolean, onDrop: ((Fling) -> Unit)?) {
        val (vx, vy) = velocity(releasedAt)
        samples = mutableListOf()
        held = false
        if (still()) {
            listOf(x, y, tilt, stretch).forEach { it.settle() }
            paint()
        } else {
            run(still)
        }
        if (dropped) onDrop?.invoke(Fling(distance = hypot(x.value, y.value).dp, speed = hypot(vx, vy)))
    }

    /** Where Patch should be for a finger this far from where it was grabbed. */
    private fun leash(dx: Float, dy: Float) {
        val reach = 200f
        val r = hypot(dx, dy)
        val k = if (r == 0f) 0f else reach * tanh(r / reach) / r
        targetX = dx * k
        targetY = dy * k
    }

    /** Finger velocity over the last 80 ms, in dp per ms; zero once the finger stops. */
    private fun velocity(now: Long): Pair<Float, Float> {
        val recent = samples.filter { now - it.millis <= 80 }
        if (recent.size < 2) return 0f to 0f
        val a = recent.first()
        val b = recent.last()
        val dt = max(1L, b.millis - a.millis).toFloat()
        return (b.x - a.x) / dt to (b.y - a.y) / dt
    }

    private fun run(still: () -> Boolean) {
        if (frames?.isActive == true) return
        frames = scope.launch {
            var last = withFrameMillis { it }
            while (held || !atRest()) {
                withFrameMillis { now ->
                    val dt = min((now - last) / 1000f, 1f / 30f)
                    last = now
                    step(now, dt, still())
                    paint()
                }
            }
            paint()
        }
    }

    private fun step(now: Long, dt: Float, still: Boolean) {
        val (vx, vy) = if (held && !still) velocity(now) else 0f to 0f
        val config = if (held) Follow else Return
        x.step(if (held) targetX else 0f, config, dt)
        y.step(if (held) targetY else 0f, config, dt)
        tilt.step((vx * 22f).coerceIn(-38f, 38f), Tilt, dt)
        stretch.step(min(hypot(vx, vy) * 0.12f, 0.18f), Tilt, dt)
    }

    private fun atRest(): Boolean {
        return listOf(x, y, tilt, stretch).all { abs(it.value) < 0.05f && abs(it.velocity) < 0.05f }
    }

    private fun paint() {
        val resting = !held && atRest()
        offsetX = if (resting) 0f else x.value
        offsetY = if (resting) 0f else y.value
        rotation = if (resting) 0f else tilt.value
        stretched = if (resting) 0f else stretch.value
    }
}
