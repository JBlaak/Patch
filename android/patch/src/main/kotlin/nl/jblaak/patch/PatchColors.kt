package nl.jblaak.patch

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

/** Every colour Patch uses; the theme tokens of the @jblaak/patch package. */
@Immutable
data class PatchColors(
    val body: Color,
    val bodyTired: Color,
    val ink: Color,
    val cheek: Color,
    val sun: Color,
    val rain: Color,
    val scarf: Color,
    val cap: Color,
    val cloud: Color,
    val snow: Color,
    val pole: Color,
    val highlight: Color,
    val bubble: Color,
    val bubbleText: Color,
    val bubbleEdge: Color,
    val bubbleShadow: Color,
    val shadow: Color,
) {
    companion object {
        /** The package's own dark defaults. */
        val Dark = PatchColors(
            body = Color(0xFF8FD8BF),
            bodyTired = Color(0xFF5E9E88),
            ink = Color(0xFF141517),
            cheek = Color(0xFFEEAB94),
            sun = Color(0xFFF0CF7E),
            rain = Color(0xFF9CC5E8),
            scarf = Color(0xFFEE8B8B),
            cap = Color(0xFFC8B8E8),
            cloud = Color(0xFF3A3B40),
            snow = Color(0xFFECEBE8),
            pole = Color(0xFFA09E99),
            highlight = Color(0x59FFFFFF),
            bubble = Color(0xFF1C2420),
            bubbleText = Color(0xFFE6EEEA),
            bubbleEdge = Color(0x12FFFFFF),
            bubbleShadow = Color(0x99000000),
            shadow = Color(0x59000000),
        )

        /** On a light background, as the App Prototype (variant D) dressed it: the same mint, a light bubble, softer shadows. */
        val Light = Dark.copy(
            cloud = Color(0xFFC9D3CF),
            snow = Color(0xFFB9C4C0),
            bubble = Color(0xFFFFFFFF),
            bubbleText = Color(0xFF17201C),
            bubbleEdge = Color(0xFFD5E0DB),
            bubbleShadow = Color(0x2E14281E),
            shadow = Color(0x2E14281E),
        )
    }
}
