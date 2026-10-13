// Patch for Jetpack Compose: a port of the TypeScript package in ../../src (art, moods, moves, speech bubble,
// accessories, poking and the spring drag). The app decides what Patch says and does.
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.paparazzi)
    `maven-publish`
}

android {
    namespace = "nl.jblaak.patch"
    compileSdk = 37

    defaultConfig {
        minSdk = 26
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    testOptions {
        unitTests.isReturnDefaultValues = true
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
        }
    }
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.foundation)
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)

    testImplementation(libs.junit)
}

// JitPack sets GROUP and VERSION from the repository and the tag it builds.
publishing {
    publications {
        register<MavenPublication>("release") {
            groupId = System.getenv("GROUP") ?: "com.github.JBlaak"
            artifactId = "patch"
            version = System.getenv("VERSION") ?: "dev"
            afterEvaluate { from(components["release"]) }
        }
    }
}
