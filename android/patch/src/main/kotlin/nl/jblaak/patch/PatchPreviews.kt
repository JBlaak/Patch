package nl.jblaak.patch

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/** Patch (or James) standing still on the app's light or dark background, as the snapshots show it. */
@Composable
internal fun PatchPreview(scene: PatchScene, dark: Boolean, style: PatchStyle = PatchStyle.Patch) {
    Box(Modifier.background(if (dark) Color(0xFF141A17) else Color(0xFFF7FAF8)).padding(24.dp)) {
        PatchContent(
            state = rememberPatchState(scene),
            still = true,
            onPoke = {},
            onGrab = {},
            onDrop = {},
            style = style,
            colors = PatchColors.of(style, dark),
            modifier = Modifier,
        )
    }
}

internal fun previewScene(mood: PatchMood, sky: PatchSky?, time: PatchTime): PatchScene {
    return PatchScene(move = PatchMove.Wave, mood = mood, line = "Hebbes.", time = time, sky = sky)
}

@Preview
@Composable
internal fun PatchCalmPreview() {
    PatchPreview(previewScene(PatchMood.Calm, sky = null, time = PatchTime.Day), dark = false)
}

@Preview
@Composable
internal fun PatchWorriedDarkPreview() {
    PatchPreview(previewScene(PatchMood.Worried, sky = null, time = PatchTime.Day), dark = true)
}

@Preview
@Composable
internal fun PatchRainPreview() {
    PatchPreview(previewScene(PatchMood.Happy, sky = PatchSky.Rain, time = PatchTime.Day), dark = false)
}

@Preview
@Composable
internal fun JamesCalmPreview() {
    PatchPreview(previewScene(PatchMood.Calm, sky = null, time = PatchTime.Day), dark = false, style = PatchStyle.James)
}

@Preview
@Composable
internal fun JamesCloudyDarkPreview() {
    PatchPreview(previewScene(PatchMood.Happy, sky = PatchSky.Cloudy, time = PatchTime.Day), dark = true, style = PatchStyle.James)
}
