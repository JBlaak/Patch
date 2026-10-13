package nl.jblaak.patch.internal

import nl.jblaak.patch.PatchMove
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

/** The pose as it looks: a full turn is no turn, whatever it turned about, and an invisible extra is wherever it is. */
private fun Pose.asSeen(): Pose {
    fun Extra.asSeen() = if (alpha == 0f) Extra(0f, Xf.None) else this
    return copy(
        body = body.copy(rotation = body.rotation % 360f),
        spinsAboutMiddle = false,
        heart = heart.asSeen(),
        sparks = sparks.map { it.asSeen() },
        zs = zs.map { it.asSeen() },
    )
}

class MovesTest {

    @Test
    fun `every move ends with Patch standing still`() {
        /* When */
        val ends = PatchMove.entries.associateWith { poseAt(it, MoveMillis + 1000).asSeen() }

        /* Then */
        assertEquals(PatchMove.entries.associateWith { Pose.Rest }, ends)
    }

    @Test
    fun `every move moves Patch while it plays`() {
        /* When */
        val moving = PatchMove.entries.filter { move -> (0L..MoveMillis step 100).any { poseAt(move, it) != Pose.Rest } }

        /* Then */
        assertEquals(PatchMove.entries, moving)
    }

    @Test
    fun `a hop lifts Patch off the ground`() {
        /* When */
        val top = poseAt(PatchMove.Hop, (MoveMillis * 0.2).toLong())

        /* Then */
        assertEquals(-36f, top.body.ty, 0.01f)
        assertNotEquals(1f, top.shadow.alpha)
    }
}
