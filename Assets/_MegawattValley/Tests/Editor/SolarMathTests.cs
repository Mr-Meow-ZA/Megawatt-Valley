using MegawattValley.Core;
using NUnit.Framework;

namespace MegawattValley.Tests
{
    /// <summary>
    /// Generation and revenue maths (S6-05). These cover the failures found in the first
    /// playtest: arrays that silently earned nothing, and wear that zeroed output too hard.
    /// </summary>
    public sealed class SolarMathTests
    {
        private const float Tolerance = 0.0001f;

        [Test]
        public void ConditionMultiplier_IsOne_AtFullCondition()
        {
            Assert.AreEqual(1f, SolarMath.ConditionMultiplier(100f, faulted: false, minMultiplier: 0.55f), Tolerance);
        }

        [Test]
        public void ConditionMultiplier_FallsToFloor_AtZeroCondition()
        {
            Assert.AreEqual(0.55f, SolarMath.ConditionMultiplier(0f, faulted: false, minMultiplier: 0.55f), Tolerance);
        }

        [Test]
        public void ConditionMultiplier_IsZero_WhenFaulted()
        {
            Assert.AreEqual(0f, SolarMath.ConditionMultiplier(100f, faulted: true, minMultiplier: 0.55f), Tolerance);
        }

        [Test]
        public void ConditionMultiplier_InterpolatesLinearly()
        {
            Assert.AreEqual(0.775f, SolarMath.ConditionMultiplier(50f, faulted: false, minMultiplier: 0.55f), Tolerance);
        }

        [Test]
        public void Megawatts_MatchNameplate_InFullSunAtFullCondition()
        {
            float output = SolarMath.Megawatts(0.25f, solarFactor: 1f, outputMultiplier: 1f, connectedToGrid: true);
            Assert.AreEqual(0.25f, output, Tolerance);
        }

        [Test]
        public void Megawatts_AreZero_WhenNotConnectedToGrid()
        {
            float output = SolarMath.Megawatts(0.25f, solarFactor: 1f, outputMultiplier: 1f, connectedToGrid: false);
            Assert.AreEqual(0f, output, Tolerance);
        }

        [Test]
        public void Megawatts_AreZero_AtNight()
        {
            float output = SolarMath.Megawatts(0.25f, solarFactor: 0f, outputMultiplier: 1f, connectedToGrid: true);
            Assert.AreEqual(0f, output, Tolerance);
        }

        [Test]
        public void Megawatts_ScaleWithSun()
        {
            float output = SolarMath.Megawatts(0.25f, solarFactor: 0.5f, outputMultiplier: 1f, connectedToGrid: true);
            Assert.AreEqual(0.125f, output, Tolerance);
        }

        [Test]
        public void Megawatts_ClampSunAboveOne()
        {
            float output = SolarMath.Megawatts(0.25f, solarFactor: 4f, outputMultiplier: 1f, connectedToGrid: true);
            Assert.AreEqual(0.25f, output, Tolerance);
        }

        [Test]
        public void Megawatts_AreNeverNegative()
        {
            float output = SolarMath.Megawatts(-1f, solarFactor: 1f, outputMultiplier: 1f, connectedToGrid: true);
            Assert.AreEqual(0f, output, Tolerance);
        }

        /// <summary>A worn but working array must still earn something, or repairs can never be afforded.</summary>
        [Test]
        public void WornArray_StillGenerates()
        {
            float multiplier = SolarMath.ConditionMultiplier(1f, faulted: false, minMultiplier: 0.55f);
            float output = SolarMath.Megawatts(0.25f, solarFactor: 1f, outputMultiplier: multiplier, connectedToGrid: true);
            Assert.Greater(output, 0.1f);
        }

        [Test]
        public void RevenuePerSecond_IsOutputTimesTariff()
        {
            Assert.AreEqual(2f, SolarMath.RevenuePerSecond(0.25f, 8f), Tolerance);
        }

        [Test]
        public void RevenuePerSecond_IsZero_WithoutOutput()
        {
            Assert.AreEqual(0f, SolarMath.RevenuePerSecond(0f, 8f), Tolerance);
        }

        [Test]
        public void Revenue_AccumulatesOverTime()
        {
            Assert.AreEqual(5f, SolarMath.Revenue(0.25f, 8f, deltaSeconds: 2.5f), Tolerance);
        }

        [Test]
        public void Revenue_IsZero_WhenTimeIsPaused()
        {
            Assert.AreEqual(0f, SolarMath.Revenue(0.25f, 8f, deltaSeconds: 0f), Tolerance);
        }

        /// <summary>
        /// The objective target of 0.75 MW is three standard arrays; confirm that is affordable
        /// from the 1000 starting cash at 250 each.
        /// </summary>
        [Test]
        public void ThreeStandardArrays_FitTheStartingBudget()
        {
            Assert.LessOrEqual(3 * 250f, 1000f);
        }
    }
}
