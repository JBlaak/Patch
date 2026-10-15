package nl.jblaak.patch.internal

import androidx.compose.animation.core.CubicBezierEasing
import nl.jblaak.patch.PatchMove

/** How long one move plays, once per appearance. */
internal const val MoveMillis = 3200L

/** A spark or a z: a one-shot extra that pops up during a move. */
internal data class Extra(
    val alpha: Float,
    val transform: Xf,
)

/**
 * Where every moving part of Patch is at one moment of a move. [Rest] is Patch standing still: what reduced motion
 * shows, and where every move ends.
 */
internal data class Pose(
    /** The whole body; about its feet, or its middle when [spinsAboutMiddle]. */
    val body: Xf,
    val spinsAboutMiddle: Boolean,
    /** The whole body fades in while peeking up. */
    val bodyAlpha: Float,
    val armRotation: Float,
    /** James's bow tie, about its knot; Patch wears none. */
    val tieRotation: Float,
    val eyesShiftX: Float,
    /** Overrides the blink while a move holds the eyes; null lets Patch blink. */
    val eyeScaleY: Float?,
    val eyeAlpha: Float,
    val happyEyesAlpha: Float,
    val cheekAlpha: Float,
    val heart: Extra,
    val sparks: List<Extra>,
    val zs: List<Extra>,
    val surprisedAlpha: Float,
    val smileAlpha: Float,
    val shadow: Extra,
) {
    companion object {
        private val hidden = Extra(alpha = 0f, transform = Xf.None)

        val Rest = Pose(
            body = Xf.None,
            spinsAboutMiddle = false,
            bodyAlpha = 1f,
            armRotation = 0f,
            tieRotation = 0f,
            eyesShiftX = 0f,
            eyeScaleY = null,
            eyeAlpha = 1f,
            happyEyesAlpha = 0f,
            cheekAlpha = 0.35f,
            heart = hidden,
            sparks = List(4) { hidden },
            zs = List(3) { hidden },
            surprisedAlpha = 0f,
            smileAlpha = 1f,
            shadow = Extra(alpha = 1f, transform = Xf.None),
        )
    }
}

/** Patch's pose [millis] into [move]. */
internal fun poseAt(move: PatchMove, millis: Long): Pose {
    val p = progress(millis, delayMillis = 0)
    val rest = Pose.Rest
    return when (move) {
        PatchMove.Wave -> rest.copy(armRotation = wave.at(p).rotation, body = lean.at(p))
        PatchMove.Hop -> rest.copy(
            body = hop.at(p),
            shadow = Extra(alpha = hopShadowAlpha.at(p), transform = hopShadow.at(p)),
        )
        PatchMove.Twirl -> rest.copy(
            body = twirl.at(p),
            spinsAboutMiddle = true,
            sparks = listOf(0L, 120L, 240L, 120L).map { delay -> spark(progress(millis, delay)) },
        )
        PatchMove.Peek -> rest.copy(
            body = peek.at(p),
            bodyAlpha = peekAlpha.at(p),
            eyesShiftX = lookLeft.at(p).tx,
        )
        PatchMove.Doze -> rest.copy(
            body = jolt.at(p),
            eyeScaleY = if (p < 1f) shut.at(p) else null,
            zs = listOf(0L, 450L, 900L).map { delay -> z(progress(millis, delay)) },
            surprisedAlpha = oLate.at(p),
            smileAlpha = 1f - oLate.at(p),
        )
        PatchMove.Jelly -> rest.copy(body = jelly.at(p), tieRotation = tieWiggle.at(p).rotation)
        PatchMove.Love -> rest.copy(
            body = squish.at(p),
            heart = Extra(alpha = heartAlpha.at(p), transform = heart.at(p)),
            eyeAlpha = 1f - happyOn.at(p),
            happyEyesAlpha = happyOn.at(p),
            cheekAlpha = blush.at(p),
        )
        PatchMove.Stretch -> rest.copy(
            body = stretch.at(p),
            surprisedAlpha = oEarly.at(p),
            smileAlpha = 1f - oEarly.at(p),
        )
    }
}

private fun progress(millis: Long, delayMillis: Long): Float {
    return ((millis - delayMillis).toFloat() / MoveMillis).coerceIn(0f, 1f)
}

private fun spark(p: Float): Extra {
    return Extra(alpha = sparkAlpha.at(p), transform = sparkScale.at(p))
}

private fun z(p: Float): Extra {
    return Extra(alpha = zAlpha.at(p), transform = zMove.at(p))
}

private val wave = transforms(
    CssEaseInOut,
    listOf(0f to Xf()),
    stopsAt(0.1f, 0.3f, 0.5f, value = Xf(rotation = -34f)),
    stopsAt(0.2f, 0.4f, value = Xf(rotation = 8f)),
    stopsAt(0.6f, 1f, value = Xf()),
)
private val lean = transforms(
    CssEaseInOut,
    stopsAt(0f, 1f, 0.6f, value = Xf()),
    stopsAt(0.1f, 0.5f, value = Xf(rotation = -4f)),
)
private val hop = transforms(
    CssEaseInOut,
    stopsAt(0f, 0.84f, 1f, value = Xf()),
    listOf(
        0.08f to Xf(sx = 1.12f, sy = 0.86f),
        0.2f to Xf(ty = -36f, sx = 0.92f, sy = 1.1f),
        0.32f to Xf(sx = 1.14f, sy = 0.86f),
        0.42f to Xf(sx = 1.04f, sy = 0.96f),
        0.5f to Xf(sx = 1.1f, sy = 0.88f),
        0.6f to Xf(ty = -22f, sx = 0.95f, sy = 1.06f),
        0.72f to Xf(sx = 1.08f, sy = 0.92f),
    ),
)
private val hopShadow = transforms(
    CssEaseInOut,
    stopsAt(0f, 0.08f, 0.32f, 0.5f, 0.72f, 1f, value = Xf()),
    listOf(0.2f to Xf(sx = 0.6f, sy = 0.6f), 0.6f to Xf(sx = 0.75f, sy = 0.75f)),
)
private val hopShadowAlpha = floats(
    CssEaseInOut,
    stopsAt(0f, 0.08f, 0.32f, 0.5f, 0.72f, 1f, value = 1f),
    listOf(0.2f to 0.5f, 0.6f to 0.7f),
)
private val twirl = transforms(
    CubicBezierEasing(0.5f, 0f, 0.3f, 1f),
    listOf(
        0f to Xf(),
        0.12f to Xf(rotation = -12f, sx = 0.9f, sy = 1.1f),
        0.55f to Xf(rotation = 360f),
        0.65f to Xf(rotation = 360f, sx = 1.1f, sy = 0.9f),
    ),
    stopsAt(0.75f, 1f, value = Xf(rotation = 360f)),
)
private val sparkAlpha = floats(
    CssEaseOut,
    stopsAt(0f, 0.45f, value = 0f),
    listOf(0.55f to 1f),
    stopsAt(0.8f, 1f, value = 0f),
)
private val sparkScale = transforms(
    CssEaseOut,
    stopsAt(0f, 0.45f, value = Xf(sx = 0.3f, sy = 0.3f)),
    listOf(0.55f to Xf(sx = 1.1f, sy = 1.1f)),
    stopsAt(0.8f, 1f, value = Xf(sx = 1.5f, sy = 1.5f, rotation = 45f)),
)
private val peek = transforms(
    CubicBezierEasing(0.3f, 1.4f, 0.5f, 1f),
    listOf(0f to Xf(ty = 80f)),
    stopsAt(0.28f, 1f, value = Xf()),
)
private val peekAlpha = floats(
    CubicBezierEasing(0.3f, 1.4f, 0.5f, 1f),
    listOf(0f to 0f),
    stopsAt(0.08f, 0.28f, 1f, value = 1f),
)
private val lookLeft = transforms(
    CssEaseInOut,
    stopsAt(0f, 0.3f, value = Xf()),
    stopsAt(0.4f, 0.78f, value = Xf(tx = -8f)),
    stopsAt(0.88f, 1f, value = Xf()),
)
private val shut = floats(
    CssEase,
    stopsAt(0f, 0.6f, value = 0.12f),
    stopsAt(0.64f, 1f, value = 1f),
)
private val zAlpha = floats(
    CssEaseOut,
    listOf(0f to 0f, 0.12f to 1f),
    stopsAt(0.5f, 1f, value = 0f),
)
private val zMove = transforms(
    CssEaseOut,
    listOf(0f to Xf(sx = 0.6f, sy = 0.6f), 0.5f to Xf(tx = 16f, ty = -34f, sx = 1.2f, sy = 1.2f), 1f to Xf()),
)
private val jolt = transforms(
    CssEaseOut,
    stopsAt(0f, 0.6f, value = Xf()),
    listOf(0.66f to Xf(ty = -16f, sx = 0.94f, sy = 1.1f), 0.74f to Xf(sx = 1.08f, sy = 0.92f)),
    stopsAt(0.82f, 1f, value = Xf()),
)
private val oLate = floats(
    CssEase,
    stopsAt(0f, 0.62f, value = 0f),
    stopsAt(0.64f, 0.86f, value = 1f),
    stopsAt(0.88f, 1f, value = 0f),
)
private val oEarly = floats(
    CssEase,
    stopsAt(0f, 0.14f, value = 0f),
    stopsAt(0.18f, 0.44f, value = 1f),
    stopsAt(0.48f, 1f, value = 0f),
)
private val jelly = transforms(
    CssEaseOut,
    stopsAt(0f, 0.72f, 1f, value = Xf()),
    listOf(
        0.08f to Xf(sx = 1.14f, sy = 0.86f),
        0.18f to Xf(sx = 0.9f, sy = 1.1f, skewX = 7f),
        0.28f to Xf(sx = 1.08f, sy = 0.92f, skewX = -6f),
        0.38f to Xf(sx = 0.96f, sy = 1.04f, skewX = 4f),
        0.48f to Xf(skewX = -3f),
        0.58f to Xf(skewX = 1.5f),
    ),
)
private val tieWiggle = transforms(
    CssEaseOut,
    stopsAt(0f, 0.08f, 0.66f, 1f, value = Xf()),
    listOf(
        0.18f to Xf(rotation = -22f),
        0.3f to Xf(rotation = 16f),
        0.42f to Xf(rotation = -9f),
        0.54f to Xf(rotation = 4f),
    ),
)
private val squish = transforms(
    CssEaseInOut,
    stopsAt(0f, 0.4f, 1f, value = Xf()),
    listOf(
        0.12f to Xf(sx = 1.1f, sy = 0.9f),
        0.22f to Xf(sx = 0.95f, sy = 1.06f),
        0.32f to Xf(sx = 1.03f, sy = 0.97f),
    ),
)
private val heart = transforms(
    CssEaseOut,
    stopsAt(0f, 0.08f, value = Xf(sx = 0.4f, sy = 0.4f)),
    listOf(
        0.2f to Xf(ty = -4f, sx = 1.2f, sy = 1.2f),
        0.3f to Xf(ty = -8f),
        0.78f to Xf(ty = -28f),
    ),
    stopsAt(0.92f, 1f, value = Xf(ty = -36f, sx = 0.9f, sy = 0.9f)),
)
private val heartAlpha = floats(
    CssEaseOut,
    stopsAt(0f, 0.08f, value = 0f),
    stopsAt(0.2f, 0.78f, value = 1f),
    stopsAt(0.92f, 1f, value = 0f),
)
private val happyOn = floats(
    CssEase,
    stopsAt(0f, 0.1f, value = 0f),
    stopsAt(0.14f, 0.82f, value = 1f),
    stopsAt(0.86f, 1f, value = 0f),
)
private val blush = floats(
    CssEase,
    stopsAt(0f, 0.1f, 0.9f, 1f, value = 0.35f),
    stopsAt(0.2f, 0.8f, value = 0.9f),
)
private val stretch = transforms(
    CssEaseInOut,
    stopsAt(0f, 0.8f, 1f, value = Xf()),
    stopsAt(0.18f, 0.4f, value = Xf(sx = 0.86f, sy = 1.28f)),
    listOf(
        0.54f to Xf(sx = 1.16f, sy = 0.84f),
        0.64f to Xf(sx = 0.97f, sy = 1.03f),
        0.72f to Xf(sx = 1.02f, sy = 0.98f),
    ),
)
