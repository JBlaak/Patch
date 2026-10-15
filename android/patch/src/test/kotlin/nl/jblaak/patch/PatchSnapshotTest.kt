package nl.jblaak.patch

import app.cash.paparazzi.DeviceConfig
import app.cash.paparazzi.Paparazzi
import com.android.ide.common.rendering.api.SessionParams
import com.android.resources.NightMode
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized

@RunWith(Parameterized::class)
class PatchMoodSnapshotTest(private val mood: PatchMood, private val dark: Boolean) {

    @get:Rule
    val paparazzi = Paparazzi(
        deviceConfig = DeviceConfig.PIXEL_5.copy(nightMode = if (dark) NightMode.NIGHT else NightMode.NOTNIGHT),
        renderingMode = SessionParams.RenderingMode.SHRINK,
    )

    @Test
    fun mood() {
        paparazzi.snapshot(name = "${mood.name.lowercase()}-${if (dark) "dark" else "light"}") {
            PatchPreview(previewScene(mood, sky = null, time = PatchTime.Day), dark = dark)
        }
    }

    companion object {
        @JvmStatic
        @Parameterized.Parameters(name = "{0}, dark={1}")
        fun cases(): List<Array<Any>> {
            return PatchMood.entries.flatMap { mood -> listOf(arrayOf<Any>(mood, false), arrayOf<Any>(mood, true)) }
        }
    }
}

@RunWith(Parameterized::class)
class PatchOutfitSnapshotTest(private val sky: PatchSky?, private val time: PatchTime) {

    @get:Rule
    val paparazzi = Paparazzi(deviceConfig = DeviceConfig.PIXEL_5, renderingMode = SessionParams.RenderingMode.SHRINK)

    @Test
    fun outfit() {
        paparazzi.snapshot(name = "${sky?.name?.lowercase() ?: "unknown"}-${time.name.lowercase()}") {
            PatchPreview(previewScene(PatchMood.Calm, sky = sky, time = time), dark = false)
        }
    }

    companion object {
        @JvmStatic
        @Parameterized.Parameters(name = "{0}, {1}")
        fun cases(): List<Array<Any?>> {
            return listOf(
                arrayOf(PatchSky.Clear, PatchTime.Day),
                arrayOf(PatchSky.Clear, PatchTime.Night),
                arrayOf(PatchSky.Cloudy, PatchTime.Day),
                arrayOf(PatchSky.Rain, PatchTime.Day),
                arrayOf(PatchSky.Snow, PatchTime.Day),
                arrayOf(null, PatchTime.Morning),
            )
        }
    }
}

@RunWith(Parameterized::class)
class JamesMoodSnapshotTest(private val mood: PatchMood, private val dark: Boolean) {

    @get:Rule
    val paparazzi = Paparazzi(
        deviceConfig = DeviceConfig.PIXEL_5.copy(nightMode = if (dark) NightMode.NIGHT else NightMode.NOTNIGHT),
        renderingMode = SessionParams.RenderingMode.SHRINK,
    )

    @Test
    fun mood() {
        paparazzi.snapshot(name = "james-${mood.name.lowercase()}-${if (dark) "dark" else "light"}") {
            PatchPreview(previewScene(mood, sky = null, time = PatchTime.Day), dark = dark, style = PatchStyle.James)
        }
    }

    companion object {
        @JvmStatic
        @Parameterized.Parameters(name = "{0}, dark={1}")
        fun cases(): List<Array<Any>> {
            return PatchMood.entries.flatMap { mood -> listOf(arrayOf<Any>(mood, false), arrayOf<Any>(mood, true)) }
        }
    }
}

@RunWith(Parameterized::class)
class JamesOutfitSnapshotTest(private val sky: PatchSky?, private val time: PatchTime) {

    @get:Rule
    val paparazzi = Paparazzi(deviceConfig = DeviceConfig.PIXEL_5, renderingMode = SessionParams.RenderingMode.SHRINK)

    @Test
    fun outfit() {
        paparazzi.snapshot(name = "james-${sky?.name?.lowercase() ?: "unknown"}-${time.name.lowercase()}") {
            PatchPreview(previewScene(PatchMood.Calm, sky = sky, time = time), dark = false, style = PatchStyle.James)
        }
    }

    companion object {
        @JvmStatic
        @Parameterized.Parameters(name = "{0}, {1}")
        fun cases(): List<Array<Any?>> {
            return PatchOutfitSnapshotTest.cases()
        }
    }
}
