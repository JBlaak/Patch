plugins {
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.paparazzi) apply false
}

subprojects {
    tasks.withType<Test>().configureEach {
        systemProperty("user.language", "en")
        systemProperty("user.country", "US")
        systemProperty("user.timezone", "UTC")
    }
}
