package nl.jblaak.patch.internal

import android.provider.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode

/**
 * Reduced motion: the system's animator duration scale is off ("Remove animations" in the accessibility settings, or
 * the developer option). Previews and snapshots show Patch standing still too.
 */
@Composable
internal fun rememberReducedMotion(): Boolean {
    val inspecting = LocalInspectionMode.current
    val resolver = LocalContext.current.contentResolver
    return remember(inspecting, resolver) {
        inspecting || Settings.Global.getFloat(resolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
    }
}

/** Milliseconds since Patch came on screen; it stays at zero while [still]. Read it while drawing only. */
@Stable
internal class PatchClock {
    var millis: Long by mutableLongStateOf(0L)
        internal set
}

@Composable
internal fun rememberPatchClock(still: Boolean): PatchClock {
    val clock = remember { PatchClock() }
    LaunchedEffect(still) {
        if (still) return@LaunchedEffect
        val start = withFrameMillis { it } - clock.millis
        while (true) {
            withFrameMillis { frame -> clock.millis = frame - start }
        }
    }
    return clock
}
