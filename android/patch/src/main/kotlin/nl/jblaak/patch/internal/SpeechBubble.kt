package nl.jblaak.patch.internal

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import nl.jblaak.patch.PatchColors

/** Patch's speech bubble, with its tail pointing down at Patch. It pops in a moment after Patch appears. */
@Composable
internal fun SpeechBubble(line: String, appearance: Int, still: Boolean, colors: PatchColors) {
    val pop = remember { Animatable(if (still) 1f else 0f) }
    LaunchedEffect(appearance, still) {
        if (still) {
            pop.snapTo(1f)
            return@LaunchedEffect
        }
        pop.snapTo(0f)
        pop.animateTo(1f, tween(durationMillis = 450, delayMillis = 350, easing = CubicBezierEasing(0.3f, 1.6f, 0.5f, 1f)))
    }
    val shape = RoundedCornerShape(16.dp)
    Box(
        modifier = Modifier
            .graphicsLayer {
                val p = pop.value
                alpha = p.coerceIn(0f, 1f)
                scaleX = 0.7f + 0.3f * p
                scaleY = 0.7f + 0.3f * p
                translationY = (1f - p) * 6.dp.toPx()
                transformOrigin = TransformOrigin(0.5f, 1f)
            }
            .widthIn(max = 320.dp)
            .drawBehind { drawTail(colors) }
            .shadow(elevation = 16.dp, shape = shape, ambientColor = colors.bubbleShadow, spotColor = colors.bubbleShadow)
            .background(colors.bubble, shape)
            .border(1.dp, colors.bubbleEdge, shape)
            .semantics { liveRegion = LiveRegionMode.Polite }
            .padding(horizontal = 16.dp, vertical = 10.dp),
    ) {
        BasicText(
            text = line,
            style = TextStyle(
                color = colors.bubbleText,
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                lineHeight = 1.4.em,
                textAlign = TextAlign.Center,
            ),
        )
    }
}

private fun DrawScope.drawTail(colors: PatchColors) {
    val half = 6.dp.toPx()
    val tip = Offset(size.width / 2, size.height + half)
    val tail = Path().apply {
        moveTo(tip.x - half, size.height - half)
        lineTo(tip.x + half, size.height - half)
        lineTo(tip.x + half, size.height)
        lineTo(tip.x, tip.y)
        lineTo(tip.x - half, size.height)
        close()
    }
    drawPath(tail, colors.bubble)
    val edge = Path().apply {
        moveTo(tip.x - half, size.height)
        lineTo(tip.x, tip.y)
        lineTo(tip.x + half, size.height)
    }
    drawPath(edge, colors.bubbleEdge, style = Stroke(width = 1.dp.toPx()))
}
