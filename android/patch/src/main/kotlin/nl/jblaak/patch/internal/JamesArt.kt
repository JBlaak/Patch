package nl.jblaak.patch.internal

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import nl.jblaak.patch.PatchMood

/*
 * James's body and face, from the James design canvas: Patch's softness on a taller egg, with a bow tie, brows, and a
 * hat for the weather. Drawn in the same art units as Patch, standing on the same spot; the weather around him is
 * Patch's.
 */

private val body = path("M58 146 C 54 100, 70 46, 100 46 C 130 46, 146 100, 142 146 C 140 164, 122 172, 100 172 C 78 172, 60 164, 58 146 Z")
private val sheen = path("M72 94 C 74 78, 82 66, 92 60")
private val arm = path("M137 130 Q154 118 158 100")
private val shoulder = Offset(137f, 130f)
private val umbrellaPole = path("M158 102 V 34")
private val umbrella = path(
    "M122 38 C 126 14, 190 14, 194 38 C 188 32, 182 32, 176 38 C 170 32, 164 32, 158 38 C 152 32, 146 32, 140 38 " +
        "C 134 32, 128 32, 122 38 Z",
)
private val knot = Offset(100f, 126f)
private val tieLeft = path("M100 126 L84.5 118 Q82 126 84.5 134 Z")
private val tieRight = path("M100 126 L115.5 118 Q118 126 115.5 134 Z")
private val tieGlint = path("M88 121.5 L92 126 L88 130.5")
private val scarfWrap = path("M62 122 Q100 138 138 122")
private val scarfEnd = path("M120 130 L126 154")
private val boaterCrown = path("M80 50 V37 Q80 34 83 34 H117 Q120 34 120 37 V50 Z")
private val bowlerCrown = path("M80 49 C 79 24, 121 24, 120 49 Z")
private val bowlerBrim = path("M68 50 Q100 56 132 50 Q130 46 100 46 Q70 46 68 50 Z")
private val bowlerSheen = path("M88 35 C 91 31, 96 29.5, 101 29.5")
// Patch's nightcap, mirrored: its tail would run into the moon on James's taller head.
private val cap = path("M128 62 C 116 44, 84 42, 70 60 C 62 46, 52 34, 40 36 C 52 44, 60 58, 66 70 C 84 60, 110 60, 128 62 Z")
private val sweat = path("M134 72 C 131 77, 131 80, 134 80 C 137 80, 137 77, 134 72 Z")
private val happyLeft = path("M83.5 94 Q88 87.5 92.5 94")
private val happyRight = path("M107.5 94 Q112 87.5 116.5 94")
private val shadesBridge = path("M98 89 H102")
private val shadesGlint = path("M82 88.5 L88 88.5")
private val eyes = listOf(Offset(88f, 92f), Offset(112f, 92f))

private val brows = mapOf(
    PatchMood.Calm to listOf("M82 81 Q88 78.5 94 80.5", "M106 80.5 Q112 78.5 118 81"),
    PatchMood.Happy to listOf("M82 79 Q88 75.5 94 78", "M106 78 Q112 75.5 118 79"),
    PatchMood.Worried to listOf("M82 81 Q88 80 94 76.5", "M106 76.5 Q112 80 118 81"),
    PatchMood.Frazzled to listOf("M82 78.5 Q88 75.5 94 78.5", "M106 82 Q112 81 118 82.5"),
    PatchMood.Tired to listOf("M82 83 Q88 82 94 83", "M106 83 Q112 82 118 83"),
).mapValues { (_, paths) -> paths.map(::path) }

private val mouths = mapOf(
    PatchMood.Calm to "M94 105 Q100 110 106 105",
    PatchMood.Happy to "M92.5 104 Q100 112 107.5 104",
    PatchMood.Worried to "M94.5 108 Q100 104.5 105.5 108",
    PatchMood.Frazzled to "M93 106.5 Q96.5 104 100 106.5 Q103.5 109 107 106.5",
    PatchMood.Tired to "M95 107 L105 107",
).mapValues { (_, d) -> path(d) }

/** A frazzled James's bow tie hangs crooked. */
private const val FrazzledTieTilt = 18f

/** A tired James leans a little. */
private const val TiredLean = 3f

internal fun DrawScope.drawJames(frame: Frame, alpha: Float) {
    val lean = if (frame.mood == PatchMood.Tired) TiredLean else 0f
    withTransform({ rotate(lean, Offset(100f, 172f)) }) { drawJamesUpright(frame, alpha) }
}

private fun DrawScope.drawJamesUpright(frame: Frame, alpha: Float) {
    val pose = frame.pose
    val colors = frame.colors
    val fill = bodyColor(frame)
    val wears = frame.accessories
    withTransform({ rotate(pose.armRotation, shoulder) }) {
        drawPath(arm, fill, alpha = alpha, style = Stroke(width = 10f, cap = StrokeCap.Round))
        if (Accessory.Umbrella in wears) {
            drawPath(umbrellaPole, colors.pole, alpha = alpha, style = Stroke(width = 3f, cap = StrokeCap.Round))
            drawPath(umbrella, colors.rain, alpha = alpha)
        }
    }
    drawPath(body, fill, alpha = alpha)
    drawPath(sheen, colors.highlight, alpha = alpha, style = Stroke(width = 5f, cap = StrokeCap.Round))
    if (Accessory.Scarf in wears) {
        drawPath(scarfWrap, colors.scarf, alpha = alpha, style = Stroke(width = 9f, cap = StrokeCap.Round))
        drawPath(scarfEnd, colors.scarf, alpha = alpha, style = Stroke(width = 8f, cap = StrokeCap.Round))
    } else {
        val tilt = (if (frame.mood == PatchMood.Frazzled) FrazzledTieTilt else 0f) + pose.tieRotation
        withTransform({ rotate(tilt, knot) }) { drawBowTie(colors.tie, colors.highlight, alpha) }
    }
    if (Accessory.Boater in wears) {
        drawOval(colors.straw, topLeft = Offset(68f, 45.4f), size = Size(64f, 9.2f), alpha = alpha)
        drawPath(boaterCrown, colors.straw, alpha = alpha)
        drawRect(colors.tie, topLeft = Offset(80f, 42.5f), size = Size(40f, 5f), alpha = alpha)
    }
    if (Accessory.Bowler in wears) {
        drawPath(bowlerCrown, colors.hat, alpha = alpha)
        drawPath(bowlerBrim, colors.hat, alpha = alpha)
        drawPath(bowlerSheen, colors.highlight, alpha = alpha, style = Stroke(width = 2f, cap = StrokeCap.Round))
    }
    if (Accessory.Cap in wears) {
        drawPath(cap, colors.cap, alpha = alpha)
        drawCircle(colors.snow, radius = 7f, center = Offset(38f, 36f), alpha = alpha)
    }
    val happy = frame.mood == PatchMood.Happy
    listOf(Offset(79f, 104f), Offset(121f, 104f)).forEach { cheek ->
        drawCircle(colors.cheek, radius = 5f, center = cheek, alpha = alpha * pose.cheekAlpha)
        if (happy) drawCircle(colors.cheek, radius = 6f, center = cheek, alpha = alpha * 0.6f)
    }
    if (frame.mood == PatchMood.Worried || frame.mood == PatchMood.Frazzled) {
        val p = frame.loopMillis?.let { loop(it, 1800) }
        val drip = p?.let { sweatDrip.at(it) } ?: 0f
        val sweatAlpha = p?.let { sweatFade.at(it) } ?: 1f
        translated(0f, drip) { drawPath(sweat, colors.rain, alpha = alpha * sweatAlpha) }
    }
    translated(pose.eyesShiftX, 0f) { drawJamesFace(frame, fill, alpha) }
}

private fun DrawScope.drawBowTie(tie: Color, glint: Color, alpha: Float) {
    drawPath(tieLeft, tie, alpha = alpha)
    drawPath(tieRight, tie, alpha = alpha)
    drawPath(tieGlint, glint, alpha = alpha * 0.7f, style = Stroke(width = 1.4f, cap = StrokeCap.Round, join = StrokeJoin.Round))
    drawRoundRect(tie, topLeft = Offset(96.2f, 121.8f), size = Size(7.6f, 8.4f), cornerRadius = CornerRadius(2f), alpha = alpha)
    drawRoundRect(
        Color.Black,
        topLeft = Offset(96.2f, 121.8f),
        size = Size(7.6f, 8.4f),
        cornerRadius = CornerRadius(2f),
        alpha = alpha * 0.2f,
        style = Stroke(width = 1f),
    )
}

private fun DrawScope.drawJamesFace(frame: Frame, fill: Color, alpha: Float) {
    val pose = frame.pose
    val ink = frame.colors.ink
    val shades = Accessory.Shades in frame.accessories
    // Unlike Patch, a happy James smiles with his eyes, not only during Love.
    val happyEyes = if (frame.mood == PatchMood.Happy) 1f else pose.happyEyesAlpha.coerceIn(0f, 1f)
    val eyeScale = pose.eyeScaleY ?: frame.loopMillis?.let { blink.at(loop(it, 5000)) } ?: 1f
    val eyeAlpha = alpha * pose.eyeAlpha * (1f - happyEyes)
    eyes.forEach { eye ->
        withTransform({ scale(1f, eyeScale, eye) }) {
            drawOval(ink, topLeft = eye - Offset(4.4f, 5.8f), size = Size(8.8f, 11.6f), alpha = eyeAlpha)
            drawCircle(Color.White, radius = 1.3f, center = eye + Offset(1.5f, -2f), alpha = eyeAlpha * 0.85f)
        }
    }
    if (frame.mood == PatchMood.Tired) {
        drawRect(fill, topLeft = Offset(82f, 84f), size = Size(12f, 8f), alpha = alpha)
        drawRect(fill, topLeft = Offset(106f, 84f), size = Size(12f, 8f), alpha = alpha)
    }
    if (shades) {
        drawRoundRect(ink, topLeft = Offset(78f, 85f), size = Size(20f, 13f), cornerRadius = CornerRadius(5f), alpha = alpha)
        drawRoundRect(ink, topLeft = Offset(102f, 85f), size = Size(20f, 13f), cornerRadius = CornerRadius(5f), alpha = alpha)
        drawPath(shadesBridge, ink, alpha = alpha, style = Stroke(width = 3f))
        drawPath(shadesGlint, frame.colors.highlight, alpha = alpha, style = Stroke(width = 2f, cap = StrokeCap.Round))
    } else {
        brows.getValue(frame.mood).forEach { brow ->
            drawPath(brow, ink, alpha = alpha, style = Stroke(width = 2.4f, cap = StrokeCap.Round))
        }
        if (happyEyes > 0f) {
            drawPath(happyLeft, ink, alpha = alpha * happyEyes, style = Stroke(width = 3f, cap = StrokeCap.Round))
            drawPath(happyRight, ink, alpha = alpha * happyEyes, style = Stroke(width = 3f, cap = StrokeCap.Round))
        }
    }
    drawPath(
        mouths.getValue(frame.mood),
        ink,
        alpha = alpha * pose.smileAlpha.coerceIn(0f, 1f),
        style = Stroke(width = 2.8f, cap = StrokeCap.Round, join = StrokeJoin.Round),
    )
    if (pose.surprisedAlpha > 0f) {
        drawOval(ink, topLeft = Offset(96f, 102f), size = Size(8f, 10f), alpha = alpha * pose.surprisedAlpha.coerceIn(0f, 1f))
    }
}
