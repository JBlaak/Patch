package nl.jblaak.patch.internal

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshots.Snapshot
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.jblaak.patch.Fling
import nl.jblaak.patch.PatchColors
import nl.jblaak.patch.PatchScene
import nl.jblaak.patch.PatchStyle
import nl.jblaak.patch.R

/** Patch itself: the art, playing the scene's move once per appearance, and the poke and drag when interactive. */
@Composable
internal fun PatchArt(
    scene: PatchScene,
    appearance: Int,
    clock: PatchClock,
    still: Boolean,
    onPoke: (() -> Unit)?,
    onGrab: (() -> Unit)?,
    onDrop: ((Fling) -> Unit)?,
    style: PatchStyle,
    colors: PatchColors,
) {
    val appearedAt = remember(appearance) { Snapshot.withoutReadObservation { clock.millis } }
    val scope = rememberCoroutineScope()
    val drag = remember { DragState(scope) }
    val currentStill by rememberUpdatedState(still)
    val currentPoke by rememberUpdatedState(onPoke)
    val currentGrab by rememberUpdatedState(onGrab)
    val currentDrop by rememberUpdatedState(onDrop)
    val interactive = onPoke != null || onGrab != null || onDrop != null
    val squish by animateFloatAsState(
        targetValue = when {
            still -> 0f
            drag.held -> 1f
            drag.pressed -> -1f
            else -> 0f
        },
        animationSpec = if (still) snap() else tween(if (drag.pressed) 60 else 180, easing = CubicBezierEasing(0.3f, 1.6f, 0.5f, 1f)),
        label = "squish",
    )
    val zs = rememberZs()
    val pokeLabel = stringResource(if (style == PatchStyle.James) R.string.james_poke else R.string.patch_poke)
    val gestures = if (interactive) {
        Modifier
            .semantics {
                role = Role.Button
                contentDescription = pokeLabel
                onClick {
                    currentPoke?.invoke()
                    true
                }
            }
            .pointerInput(Unit) {
                with(drag) {
                    handle(
                        still = { currentStill },
                        onPoke = { currentPoke?.invoke() },
                        onGrab = { currentGrab?.invoke() },
                        onDrop = { fling -> currentDrop?.invoke(fling) },
                    )
                }
            }
    } else {
        Modifier
    }
    Box(
        modifier = gestures
            .size(ArtWidth.dp, ArtHeight.dp)
            .graphicsLayer {
                val stretch = drag.stretched
                translationX = drag.offsetX.dp.toPx()
                translationY = drag.offsetY.dp.toPx()
                rotationZ = drag.rotation
                scaleX = 1f - stretch * 0.5f
                scaleY = 1f + stretch
                transformOrigin = TransformOrigin(0.5f, 0.7f)
            },
    ) {
        Canvas(
            Modifier
                .matchParentSize()
                .graphicsLayer {
                    scaleX = if (squish < 0f) 1f + 0.06f * squish else 1f + 0.04f * squish
                    scaleY = if (squish < 0f) 1f + 0.1f * squish else 1f + 0.04f * squish
                    transformOrigin = TransformOrigin(0.5f, 0.85f)
                },
        ) {
            val millis = clock.millis
            val held = drag.held
            val moving = poseAt(scene.move, millis - appearedAt)
            val pose = when {
                still -> Pose.Rest
                held -> moving.copy(surprisedAlpha = 1f, smileAlpha = 0f)
                else -> moving
            }
            val frame = Frame(
                style = style,
                mood = scene.mood,
                accessories = accessoriesFor(style, scene.sky, scene.time),
                pose = pose,
                loopMillis = if (still) null else millis,
                colors = colors,
                zs = zs,
            )
            scale(size.width / ArtWidth, size.height / ArtHeight, pivot = Offset.Zero) {
                translate(10f, 10f) { drawPatch(frame) }
            }
        }
    }
}

/** The three z's of a doze, laid out at their SVG sizes in art units. */
@Composable
private fun rememberZs(): List<TextLayoutResult> {
    val measurer = rememberTextMeasurer()
    val density = LocalDensity.current
    return remember(measurer, density) {
        val unit = 1f / (density.density * density.fontScale)
        listOf("z" to 12f, "z" to 15f, "Z" to 18f).map { (letter, size) ->
            measurer.measure(letter, TextStyle(fontSize = (size * unit).sp, fontWeight = FontWeight.Bold))
        }
    }
}
