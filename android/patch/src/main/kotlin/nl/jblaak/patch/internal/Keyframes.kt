package nl.jblaak.patch.internal

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.LinearEasing

/** A CSS transform as Patch's keyframes use it: translate, then rotate, then scale, then skew, about an origin. */
internal data class Xf(
    val tx: Float = 0f,
    val ty: Float = 0f,
    val sx: Float = 1f,
    val sy: Float = 1f,
    val rotation: Float = 0f,
    val skewX: Float = 0f,
) {
    companion object {
        val None = Xf()
    }
}

internal val CssEase = CubicBezierEasing(0.25f, 0.1f, 0.25f, 1f)
internal val CssEaseIn = CubicBezierEasing(0.42f, 0f, 1f, 1f)
internal val CssEaseOut = CubicBezierEasing(0f, 0f, 0.58f, 1f)
internal val CssEaseInOut = CubicBezierEasing(0.42f, 0f, 0.58f, 1f)
internal val CssLinear = LinearEasing

/** Keyframes like a CSS @keyframes rule: [easing] applies to every segment between two stops. */
internal class Track<T>(
    private val easing: Easing,
    private val lerp: (T, T, Float) -> T,
    stops: List<Pair<Float, T>>,
) {
    private val stops = stops.sortedBy { it.first }

    fun at(progress: Float): T {
        val p = progress.coerceIn(0f, 1f)
        val after = stops.indexOfFirst { it.first >= p }
        if (after <= 0) return stops[if (after == 0) 0 else stops.lastIndex].second
        val (from, a) = stops[after - 1]
        val (to, b) = stops[after]
        val local = if (to == from) 1f else (p - from) / (to - from)
        return lerp(a, b, easing.transform(local))
    }
}

/** The same [value] at each of [stops], like `0%, 84%, 100% { … }`. */
internal fun <T> stopsAt(vararg stops: Float, value: T): List<Pair<Float, T>> = stops.map { it to value }

internal fun floats(easing: Easing, vararg stops: List<Pair<Float, Float>>): Track<Float> {
    return Track(easing, ::lerpFloat, stops.flatMap { it })
}

internal fun transforms(easing: Easing, vararg stops: List<Pair<Float, Xf>>): Track<Xf> {
    return Track(easing, ::lerpXf, stops.flatMap { it })
}

private fun lerpFloat(a: Float, b: Float, t: Float): Float = a + (b - a) * t

private fun lerpXf(a: Xf, b: Xf, t: Float): Xf {
    return Xf(
        tx = lerpFloat(a.tx, b.tx, t),
        ty = lerpFloat(a.ty, b.ty, t),
        sx = lerpFloat(a.sx, b.sx, t),
        sy = lerpFloat(a.sy, b.sy, t),
        rotation = lerpFloat(a.rotation, b.rotation, t),
        skewX = lerpFloat(a.skewX, b.skewX, t),
    )
}

/** Progress through a [durationMillis] loop at [millis], started [offsetMillis] early (a negative CSS delay). */
internal fun loop(millis: Long, durationMillis: Long, offsetMillis: Long = 0): Float {
    return ((millis + offsetMillis) % durationMillis).toFloat() / durationMillis
}
