using MegawattValley.Core;
using MegawattValley.Data;
using NUnit.Framework;
using UnityEngine;

namespace MegawattValley.Tests
{
    public sealed class CapabilityAndSoilingTests
    {
        [Test]
        public void SoilingMultiplier_StartsCleanAndPenalisesDust()
        {
            Assert.AreEqual(1f, SolarMath.SoilingMultiplier(0f), 0.001f);
            Assert.Less(SolarMath.SoilingMultiplier(100f), 0.5f);
            Assert.Greater(SolarMath.SoilingMultiplier(50f), SolarMath.SoilingMultiplier(100f));
        }

        [Test]
        public void CapabilityIds_AreStable()
        {
            Assert.AreEqual("radio_dispatch", CapabilityIds.RadioDispatch);
            Assert.AreEqual("basic_cleaning_kit", CapabilityIds.BasicCleaningKit);
        }
    }
}
