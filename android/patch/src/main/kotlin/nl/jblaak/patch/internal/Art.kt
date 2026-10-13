package nl.jblaak.patch.internal

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Matrix
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.drawText
import nl.jblaak.patch.PatchColors
import nl.jblaak.patch.PatchMood
import nl.jblaak.patch.PatchSky
import nl.jblaak.patch.PatchTime
import kotlin.math.tan

/*
 * Patch's art, ported from the @jblaak/patch package's src/art.ts (its SVG, viewBox -10 -10 220 200). Everything is
 * drawn in that SVG's units; the caller scales the canvas to fit.
 */

internal const val ArtWidth = 220f
internal const val ArtHeight = 200f

private fun path(d: String): Path = PathParser().parsePathString(d).toPath()

private val mouthSmile = path("M93 134 Q100 140 107 134")
private val mouthFlat = path("M94 136 L106 136")
private val mouthFrown = path("M93 138 Q100 133 107 138")
private val sparkBig = path("M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z")
private val sparkSmall = path("M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z")
private val sunRays = path(
    "M24 8 V12 M24 48 V52 M2 30 H6 M42 30 H46 M8.5 14.5 L11.3 17.3 M36.7 42.7 L39.5 45.5 M8.5 45.5 L11.3 42.7 " +
        "M36.7 17.3 L39.5 14.5",
)
private val cloud = path("M18 44 C 8 44, 6 30, 18 28 C 20 16, 38 14, 42 26 C 52 22, 60 32, 54 40 C 54 44, 50 44, 46 44 Z")
private val moon = path("M170 14 A 14 14 0 1 0 182 34 A 11 11 0 1 1 170 14 Z")
private val drops = listOf(
    "M20 40 l-3 8",
    "M44 20 l-3 8",
    "M30 90 l-3 8",
    "M180 120 l-3 8",
    "M190 70 l-3 8",
    "M10 120 l-3 8",
).map(::path)
private val dropOffsets = listOf(0L, 400L, 700L, 200L, 900L, 550L)
private val flakes = listOf(
    Offset(20f, 30f) to 2.5f,
    Offset(46f, 10f) to 2f,
    Offset(176f, 40f) to 2.5f,
    Offset(190f, 90f) to 2f,
    Offset(12f, 100f) to 2f,
    Offset(160f, 4f) to 2f,
)
private val flakeOffsets = listOf(0L, 1000L, 2000L, 500L, 2600L, 1500L)
private val steam = path("M27 142 C 23 137, 31 133, 27 127")
private val steamB = path("M35 140 C 31 135, 39 131, 35 125")
private val mugHandle = path("M21 154 C 12 154, 12 166, 21 166")
private val mug = path("M20 147 H 42 V 166 C 42 170, 39 172, 35 172 H 27 C 23 172, 20 170, 20 166 Z")
private val mugGlint = path("M25 153 V 163")
private val heart = path("M100 60 C 92 52, 86 46, 92 40 C 96 36, 100 40, 100 43 C 100 40, 104 36, 108 40 C 114 46, 108 52, 100 60 Z")
private val sparks = listOf(
    Offset(52f, 72f) to sparkBig,
    Offset(156f, 62f) to sparkBig,
    Offset(36f, 132f) to sparkSmall,
    Offset(170f, 140f) to sparkSmall,
)
private val arm = path("M138 130 Q156 116 160 98")
private val umbrellaPole = path("M160 100 V 46")
private val umbrella = path(
    "M124 50 C 128 26, 192 26, 196 50 C 190 44, 184 44, 178 50 C 172 44, 166 44, 160 50 C 154 44, 148 44, 142 50 " +
        "C 136 44, 130 44, 124 50 Z",
)
private val body = path("M50 138 C 46 96, 72 68, 100 68 C 132 68, 152 96, 148 138 C 146 158, 128 166, 100 166 C 70 166, 52 158, 50 138 Z")
private val sheen = path("M68 96 C 74 84, 86 78, 96 78")
private val scarfWrap = path("M56 146 Q100 162 144 146")
private val scarfEnd = path("M124 154 L130 176")
private val cap = path("M70 82 C 82 66, 116 62, 132 80 C 140 64, 150 52, 162 54 C 150 62, 142 76, 136 88 C 116 78, 88 78, 70 82 Z")
private val sweat = path("M138 88 C 134 94, 134 98, 138 98 C 142 98, 142 94, 138 88 Z")
private val browLeft = path("M80 106 L91 102")
private val browRight = path("M109 102 L120 106")
private val shadesBridge = path("M96 115 H104")
private val shadesGlint = path("M80 114 L86 114")
private val happyLeft = path("M81 121 Q86 113 91 121")
private val happyRight = path("M109 121 Q114 113 119 121")

private val feet = Offset(100f, 166f)
private val middle = Offset(100f, 117f)

/** What Patch wears and what surrounds it. */
internal enum class Accessory { Sun, Shades, Cloud, Rain, Umbrella, Snow, Scarf, Moon, Cap, Mug }

/** From the sky and the time of day; with an unknown sky, by time of day only. */
internal fun accessoriesFor(sky: PatchSky?, time: PatchTime): Set<Accessory> {
    return when (sky) {
        PatchSky.Clear -> if (time == PatchTime.Night) setOf(Accessory.Moon, Accessory.Cap) else setOf(Accessory.Sun, Accessory.Shades)
        PatchSky.Cloudy -> setOf(Accessory.Cloud)
        PatchSky.Rain -> setOf(Accessory.Rain, Accessory.Umbrella)
        PatchSky.Snow -> setOf(Accessory.Snow, Accessory.Scarf)
        null -> when (time) {
            PatchTime.Night -> setOf(Accessory.Moon, Accessory.Cap)
            PatchTime.Morning -> setOf(Accessory.Mug)
            PatchTime.Day, PatchTime.Evening -> emptySet()
        }
    }
}

/** Everything the art needs for one frame. */
internal class Frame(
    val mood: PatchMood,
    val accessories: Set<Accessory>,
    val pose: Pose,
    /** Milliseconds for the looping bits (breathing, blinking, weather); null when standing still. */
    val loopMillis: Long?,
    val colors: PatchColors,
    val zs: List<TextLayoutResult>,
)

internal fun DrawScope.drawPatch(frame: Frame) {
    val wears = frame.accessories
    val colors = frame.colors
    val millis = frame.loopMillis
    if (Accessory.Sun in wears) drawSun(colors, millis)
    if (Accessory.Cloud in wears) {
        val x = if (millis == null) 0f else cloudDrift.at(loop(millis, 9000))
        translated(x, 0f) { drawPath(cloud, colors.cloud) }
    }
    if (Accessory.Moon in wears) drawMoon(colors, millis)
    if (Accessory.Rain in wears) drawRain(colors, millis)
    if (Accessory.Snow in wears) drawSnow(colors, millis)
    drawShadow(frame.pose.shadow, colors)
    if (Accessory.Mug in wears) drawMug(colors, millis)
    drawExtras(frame)
    val pose = frame.pose
    transformed(pose.body, if (pose.spinsAboutMiddle) middle else feet) {
        val breath = if (millis == null) Xf.None else breathe.at(loop(millis, 3600))
        transformed(breath, feet) {
            drawBody(frame, pose.bodyAlpha.coerceIn(0f, 1f))
        }
    }
}

private fun DrawScope.drawSun(colors: PatchColors, millis: Long?) {
    val center = Offset(24f, 30f)
    val turn = if (millis == null) 0f else loop(millis, 18000) * 360f
    withTransform({ rotate(turn, center) }) {
        drawCircle(colors.sun, radius = 12f, center = center)
        drawPath(sunRays, colors.sun, style = Stroke(width = 3f, cap = StrokeCap.Round))
    }
}

private fun DrawScope.drawMoon(colors: PatchColors, millis: Long?) {
    drawPath(moon, colors.sun)
    listOf(Triple(Offset(18f, 24f), 2f, 0L), Triple(Offset(42f, 8f), 1.5f, 800L), Triple(Offset(150f, 44f), 1.5f, 1600L))
        .forEach { (center, radius, offset) ->
            val alpha = if (millis == null) 1f else twinkle.at(loop(millis, 2400, offset))
            drawCircle(colors.snow, radius = radius, center = center, alpha = alpha)
        }
}

private fun DrawScope.drawRain(colors: PatchColors, millis: Long?) {
    drops.forEachIndexed { index, drop ->
        val p = millis?.let { loop(it, 1100, dropOffsets[index]) }
        val move = p?.let { fall.at(it) } ?: Xf.None
        val alpha = p?.let { fallAlpha.at(it) } ?: 1f
        translated(move.tx, move.ty) {
            drawPath(drop, colors.rain, alpha = alpha, style = Stroke(width = 2f, cap = StrokeCap.Round))
        }
    }
}

private fun DrawScope.drawSnow(colors: PatchColors, millis: Long?) {
    flakes.forEachIndexed { index, (center, radius) ->
        val p = millis?.let { loop(it, 3200, flakeOffsets[index]) }
        val move = p?.let { drift.at(it) } ?: Xf.None
        val alpha = p?.let { driftAlpha.at(it) } ?: 1f
        drawCircle(colors.snow, radius = radius, center = center + Offset(move.tx, move.ty), alpha = alpha)
    }
}

private fun DrawScope.drawShadow(shadow: Extra, colors: PatchColors) {
    val center = Offset(100f, 172f)
    transformed(shadow.transform, center) {
        drawOval(colors.shadow, topLeft = center - Offset(40f, 6f), size = Size(80f, 12f), alpha = shadow.alpha)
    }
}

private fun DrawScope.drawMug(colors: PatchColors, millis: Long?) {
    listOf(steam to 0L, steamB to 1200L).forEach { (wisp, offset) ->
        val p = millis?.let { loop(it, 2400, offset) }
        val rise = p?.let { steamRise.at(it) } ?: 0f
        val alpha = p?.let { steamAlpha.at(it) } ?: 0.6f
        translated(0f, rise) {
            drawPath(wisp, colors.snow, alpha = alpha, style = Stroke(width = 2.5f, cap = StrokeCap.Round))
        }
    }
    drawPath(mugHandle, colors.scarf, style = Stroke(width = 3.5f, cap = StrokeCap.Round))
    drawPath(mug, colors.scarf)
    drawOval(colors.ink, topLeft = Offset(22f, 146.5f), size = Size(18f, 4f))
    drawPath(mugGlint, colors.highlight, style = Stroke(width = 2.5f, cap = StrokeCap.Round))
}

private fun DrawScope.drawExtras(frame: Frame) {
    val pose = frame.pose
    val colors = frame.colors
    if (pose.heart.alpha > 0f) {
        transformed(pose.heart.transform, Offset(100f, 48f)) {
            drawPath(heart, colors.cheek, alpha = pose.heart.alpha.coerceIn(0f, 1f))
        }
    }
    sparks.forEachIndexed { index, (at, spark) ->
        val extra = pose.sparks[index]
        if (extra.alpha > 0f) {
            translated(at.x, at.y) {
                transformed(extra.transform, Offset.Zero) { drawPath(spark, colors.sun, alpha = extra.alpha.coerceIn(0f, 1f)) }
            }
        }
    }
    frame.zs.forEachIndexed { index, z ->
        val extra = pose.zs[index]
        if (extra.alpha > 0f) {
            val topLeft = Offset(146f, 78f - z.firstBaseline)
            val center = topLeft + Offset(z.size.width / 2f, z.size.height / 2f)
            transformed(extra.transform, center) {
                drawText(z, color = bodyColor(frame), topLeft = topLeft, alpha = extra.alpha.coerceIn(0f, 1f))
            }
        }
    }
}

private fun bodyColor(frame: Frame): Color {
    return if (frame.mood == PatchMood.Tired) frame.colors.bodyTired else frame.colors.body
}

private fun DrawScope.drawBody(frame: Frame, alpha: Float) {
    val pose = frame.pose
    val colors = frame.colors
    val fill = bodyColor(frame)
    val wears = frame.accessories
    withTransform({ rotate(pose.armRotation, Offset(138f, 130f)) }) {
        drawPath(arm, fill, alpha = alpha, style = Stroke(width = 10f, cap = StrokeCap.Round))
    }
    if (Accessory.Umbrella in wears) {
        drawPath(umbrellaPole, colors.pole, alpha = alpha, style = Stroke(width = 3f, cap = StrokeCap.Round))
        drawPath(umbrella, colors.rain, alpha = alpha)
    }
    drawPath(body, fill, alpha = alpha)
    drawPath(sheen, colors.highlight, alpha = alpha, style = Stroke(width = 5f, cap = StrokeCap.Round))
    if (Accessory.Scarf in wears) {
        drawPath(scarfWrap, colors.scarf, alpha = alpha, style = Stroke(width = 9f, cap = StrokeCap.Round))
        drawPath(scarfEnd, colors.scarf, alpha = alpha, style = Stroke(width = 8f, cap = StrokeCap.Round))
    }
    if (Accessory.Cap in wears) {
        drawPath(cap, colors.cap, alpha = alpha)
        drawCircle(colors.snow, radius = 7f, center = Offset(164f, 54f), alpha = alpha)
    }
    listOf(Offset(76f, 134f), Offset(124f, 134f)).forEach { cheek ->
        drawCircle(colors.cheek, radius = 5f, center = cheek, alpha = alpha * pose.cheekAlpha)
        if (frame.mood == PatchMood.Happy) drawCircle(colors.cheek, radius = 6f, center = cheek, alpha = alpha * 0.6f)
    }
    if (frame.mood == PatchMood.Worried || frame.mood == PatchMood.Frazzled) drawSweat(colors, frame.loopMillis, alpha)
    translated(pose.eyesShiftX, 0f) { drawFace(frame, fill, alpha) }
}

private fun DrawScope.drawSweat(colors: PatchColors, millis: Long?, alpha: Float) {
    val p = millis?.let { loop(it, 1800) }
    val drip = p?.let { sweatDrip.at(it) } ?: 0f
    val sweatAlpha = p?.let { sweatFade.at(it) } ?: 1f
    translated(0f, drip) { drawPath(sweat, colors.rain, alpha = alpha * sweatAlpha) }
}

private fun DrawScope.drawFace(frame: Frame, fill: Color, alpha: Float) {
    val pose = frame.pose
    val ink = frame.colors.ink
    val millis = frame.loopMillis
    val eyeScale = pose.eyeScaleY ?: millis?.let { blink.at(loop(it, 5000)) } ?: 1f
    listOf(Offset(86f, 118f), Offset(114f, 118f)).forEach { eye ->
        withTransform({ scale(1f, eyeScale, eye) }) {
            drawOval(ink, topLeft = eye - Offset(5f, 7f), size = Size(10f, 14f), alpha = alpha * pose.eyeAlpha)
        }
    }
    if (frame.mood == PatchMood.Tired) {
        drawRect(fill, topLeft = Offset(79f, 109f), size = Size(14f, 9f), alpha = alpha)
        drawRect(fill, topLeft = Offset(107f, 109f), size = Size(14f, 9f), alpha = alpha)
    }
    if (frame.mood == PatchMood.Worried) {
        drawPath(browLeft, ink, alpha = alpha, style = Stroke(width = 2.5f, cap = StrokeCap.Round))
        drawPath(browRight, ink, alpha = alpha, style = Stroke(width = 2.5f, cap = StrokeCap.Round))
    }
    if (Accessory.Shades in frame.accessories) drawShades(frame.colors, alpha)
    if (pose.happyEyesAlpha > 0f) {
        val happy = alpha * pose.happyEyesAlpha.coerceIn(0f, 1f)
        drawPath(happyLeft, ink, alpha = happy, style = Stroke(width = 3f, cap = StrokeCap.Round))
        drawPath(happyRight, ink, alpha = happy, style = Stroke(width = 3f, cap = StrokeCap.Round))
    }
    val mouth = when (frame.mood) {
        PatchMood.Tired -> mouthFlat
        PatchMood.Worried -> mouthFrown
        PatchMood.Calm, PatchMood.Happy, PatchMood.Frazzled -> mouthSmile
    }
    drawPath(mouth, ink, alpha = alpha * pose.smileAlpha.coerceIn(0f, 1f), style = Stroke(width = 3f, cap = StrokeCap.Round))
    if (pose.surprisedAlpha > 0f) {
        drawOval(ink, topLeft = Offset(96f, 132f), size = Size(8f, 10f), alpha = alpha * pose.surprisedAlpha.coerceIn(0f, 1f))
    }
}

private fun DrawScope.drawShades(colors: PatchColors, alpha: Float) {
    drawRoundRect(colors.ink, topLeft = Offset(76f, 111f), size = Size(20f, 13f), cornerRadius = CornerRadius(5f), alpha = alpha)
    drawRoundRect(colors.ink, topLeft = Offset(104f, 111f), size = Size(20f, 13f), cornerRadius = CornerRadius(5f), alpha = alpha)
    drawPath(shadesBridge, colors.ink, alpha = alpha, style = Stroke(width = 3f))
    drawPath(shadesGlint, colors.highlight, alpha = alpha, style = Stroke(width = 2f, cap = StrokeCap.Round))
}

private inline fun DrawScope.translated(x: Float, y: Float, block: DrawScope.() -> Unit) {
    withTransform({ translate(x, y) }, block)
}

/** A CSS transform about [origin]: translate, rotate, scale, then skew. */
private inline fun DrawScope.transformed(xf: Xf, origin: Offset, block: DrawScope.() -> Unit) {
    if (xf == Xf.None) {
        block()
        return
    }
    withTransform(
        {
            translate(xf.tx, xf.ty)
            rotate(xf.rotation, origin)
            scale(xf.sx, xf.sy, origin)
            if (xf.skewX != 0f) {
                translate(origin.x, origin.y)
                transform(Matrix().apply { values[Matrix.SkewX] = tan(Math.toRadians(xf.skewX.toDouble())).toFloat() })
                translate(-origin.x, -origin.y)
            }
        },
        block,
    )
}

private val cloudDrift = floats(CssEaseInOut, stopsAt(0f, 1f, value = 0f), listOf(0.5f to 14f))
private val twinkle = floats(CssEaseInOut, stopsAt(0f, 1f, value = 0.25f), listOf(0.5f to 1f))
private val fall = transforms(CssLinear, listOf(0f to Xf(ty = -24f), 1f to Xf(tx = -6f, ty = 70f)))
private val fallAlpha = floats(CssLinear, listOf(0f to 0f, 0.15f to 0.8f, 1f to 0f))
private val drift = transforms(
    CssLinear,
    listOf(0f to Xf(ty = -20f), 0.5f to Xf(tx = 6f, ty = 30f), 1f to Xf(tx = -4f, ty = 80f)),
)
private val driftAlpha = floats(CssLinear, listOf(0f to 0f, 0.15f to 1f, 1f to 0f))
private val steamRise = floats(CssEaseOut, listOf(0f to 4f, 1f to -8f))
private val steamAlpha = floats(CssEaseOut, listOf(0f to 0f, 0.35f to 0.6f, 1f to 0f))
private val sweatDrip = floats(CssEaseIn, listOf(0f to 0f, 1f to 14f))
private val sweatFade = floats(CssEaseIn, listOf(0f to 0f, 0.2f to 1f, 1f to 0f))
private val breathe = transforms(CssEaseInOut, stopsAt(0f, 1f, value = Xf()), listOf(0.5f to Xf(sx = 1.04f, sy = 0.96f)))
private val blink = floats(CssEase, stopsAt(0f, 0.93f, 1f, value = 1f), listOf(0.96f to 0.1f))
