package nl.jblaak.patch

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import nl.jblaak.patch.internal.PatchArt
import nl.jblaak.patch.internal.SpeechBubble
import nl.jblaak.patch.internal.rememberPatchClock
import nl.jblaak.patch.internal.rememberReducedMotion

enum class PatchMove { Wave, Hop, Twirl, Peek, Doze, Jelly, Love, Stretch }

enum class PatchMood { Calm, Happy, Worried, Frazzled, Tired }

enum class PatchSky { Clear, Cloudy, Rain, Snow }

enum class PatchTime { Morning, Day, Evening, Night }

/** One appearance of Patch: the move it plays once, its face, its line, and what it wears. */
data class PatchScene(
    val move: PatchMove,
    val mood: PatchMood,
    val line: String,
    val time: PatchTime,
    /** Null when the weather is unknown: Patch dresses by [time] only. */
    val sky: PatchSky?,
)

/** How Patch was let go after a drag. */
data class Fling(
    /** How far from home Patch was let go. */
    val distance: Dp,
    /** How fast the finger was moving when it let go, in dp per millisecond. */
    val speed: Float,
)

/** What Patch shows. Each [appear] replays the move and pops the bubble again, even for the same scene. */
@Stable
class PatchState internal constructor(scene: PatchScene) {

    var scene: PatchScene by mutableStateOf(scene)
        private set

    internal var appearance: Int by mutableIntStateOf(0)
        private set

    fun appear(scene: PatchScene) {
        this.scene = scene
        appearance++
    }
}

/** Patch, appearing with [initial]. */
@Composable
fun rememberPatchState(initial: PatchScene): PatchState {
    return remember { PatchState(initial) }
}

/**
 * Patch with its speech bubble. With [onPoke], [onGrab] or [onDrop] Patch is a button: it squishes when pressed, and
 * can be dragged on a spring leash, springing home with a wobble when let go. A press that moved is a drag, not a poke.
 * With reduced motion (animations off in the system settings) Patch and the bubble still appear, but nothing moves, and
 * a dragged Patch snaps home.
 */
@Composable
fun Patch(
    state: PatchState,
    onPoke: (() -> Unit)?,
    onGrab: (() -> Unit)?,
    onDrop: ((Fling) -> Unit)?,
    modifier: Modifier = Modifier,
    /** Opt-in override; by default the light or dark tokens follow the system theme. */
    colors: PatchColors = if (isSystemInDarkTheme()) PatchColors.Dark else PatchColors.Light,
) {
    PatchContent(
        state = state,
        still = rememberReducedMotion(),
        onPoke = onPoke,
        onGrab = onGrab,
        onDrop = onDrop,
        colors = colors,
        modifier = modifier,
    )
}

@Composable
internal fun PatchContent(
    state: PatchState,
    still: Boolean,
    onPoke: (() -> Unit)?,
    onGrab: (() -> Unit)?,
    onDrop: ((Fling) -> Unit)?,
    colors: PatchColors,
    modifier: Modifier,
) {
    val clock = rememberPatchClock(still)
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        SpeechBubble(
            line = state.scene.line,
            appearance = state.appearance,
            still = still,
            colors = colors,
        )
        PatchArt(
            scene = state.scene,
            appearance = state.appearance,
            clock = clock,
            still = still,
            onPoke = onPoke,
            onGrab = onGrab,
            onDrop = onDrop,
            colors = colors,
        )
    }
}
