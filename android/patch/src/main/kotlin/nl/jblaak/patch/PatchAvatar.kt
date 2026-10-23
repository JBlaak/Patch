package nl.jblaak.patch

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import nl.jblaak.patch.internal.Frame
import nl.jblaak.patch.internal.Pose
import nl.jblaak.patch.internal.drawPatch
import nl.jblaak.patch.internal.rememberPatchClock
import nl.jblaak.patch.internal.rememberReducedMotion

/**
 * Patch (or James) as an avatar: just the blob and its [mood]'s face, square, without the bubble, the weather or the
 * shadow, for beside a line of text. It breathes and blinks; with reduced motion it stands still. Size it with
 * [modifier]. The content description is Patch's (or James's) name.
 */
@Composable
fun PatchAvatar(
    mood: PatchMood,
    modifier: Modifier = Modifier,
    style: PatchStyle = PatchStyle.Patch,
    /** Opt-in override; by default the [style]'s light or dark tokens follow the system theme. */
    colors: PatchColors = PatchColors.of(style, dark = isSystemInDarkTheme()),
) {
    PatchAvatarContent(mood = mood, still = rememberReducedMotion(), style = style, colors = colors, modifier = modifier)
}

@Composable
internal fun PatchAvatarContent(mood: PatchMood, still: Boolean, style: PatchStyle, colors: PatchColors, modifier: Modifier) {
    val clock = rememberPatchClock(still)
    val name = stringResource(if (style == PatchStyle.James) R.string.james_name else R.string.patch_name)
    val crop = if (style == PatchStyle.James) jamesCrop else patchCrop
    Canvas(
        modifier
            .aspectRatio(1f)
            .semantics { contentDescription = name },
    ) {
        val frame = Frame(
            style = style,
            mood = mood,
            accessories = emptySet(),
            pose = avatarPose,
            loopMillis = if (still) null else clock.millis,
            colors = colors,
            zs = emptyList(),
        )
        scale(size.width / crop.side, size.height / crop.side, pivot = Offset.Zero) {
            translate(-crop.left, -crop.top) { drawPatch(frame) }
        }
    }
}

/** The square of the art, in its SVG units, that holds the body and the arm. */
private class Crop(val left: Float, val top: Float, val side: Float)

private val patchCrop = Crop(left = 42f, top = 55f, side = 124f)
private val jamesCrop = Crop(left = 38f, top = 40f, side = 138f)

private val avatarPose = Pose.Rest.copy(shadow = Pose.Rest.shadow.copy(alpha = 0f))
