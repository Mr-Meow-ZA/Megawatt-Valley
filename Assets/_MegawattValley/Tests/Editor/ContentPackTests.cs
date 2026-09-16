using MegawattValley.Data;
using NUnit.Framework;
using UnityEditor;

namespace MegawattValley.Tests
{
    /// <summary>
    /// Sanity checks on the shipped content pack (S6-04 / S6-05). These fail loudly if a balance
    /// edit makes a product nonsensical or breaks the scenario's reachability.
    /// </summary>
    public sealed class ContentPackTests
    {
        private const string StandardArrayPath = "Assets/_MegawattValley/Data/Solar_StandardArray.asset";
        private const string BargainArrayPath = "Assets/_MegawattValley/Data/Solar_BargainLot.asset";
        private const string ScenarioPath = "Assets/_MegawattValley/Data/Scenario_PrototypeValley.asset";
        private const string EventPath = "Assets/_MegawattValley/Data/Event_SupplierSoftPitch.asset";

        private static T Load<T>(string path) where T : UnityEngine.Object
        {
            var asset = AssetDatabase.LoadAssetAtPath<T>(path);
            Assert.IsNotNull(asset, $"Missing content asset at {path}");
            return asset;
        }

        [Test]
        public void StandardArray_HasSaneEconomy()
        {
            var array = Load<SolarArrayDefinition>(StandardArrayPath);
            Assert.Greater(array.BuildCost, 0f);
            Assert.Greater(array.NameplateMegawatts, 0f);
            Assert.Greater(array.RevenuePerMwPerSecond, 0f);
            Assert.Greater(array.Footprint.x, 0f);
            Assert.Greater(array.Footprint.z, 0f);
        }

        [Test]
        public void StandardArray_WearsSlowlyEnoughToBePlayable()
        {
            var array = Load<SolarArrayDefinition>(StandardArrayPath);

            // The first playtest wore arrays out in about 80 seconds. Require at least
            // five simulated minutes of generation before condition could reach zero.
            float secondsToWearOut = 100f / array.WearPerSecond;
            Assert.Greater(secondsToWearOut, 300f, "Arrays wear out too fast to be playable.");
        }

        [Test]
        public void StandardArray_PaysBackWithinAReasonableTime()
        {
            var array = Load<SolarArrayDefinition>(StandardArrayPath);
            float revenuePerSecondInFullSun = array.NameplateMegawatts * array.RevenuePerMwPerSecond;
            float paybackSeconds = array.BuildCost / revenuePerSecondInFullSun;

            Assert.Greater(paybackSeconds, 10f, "An array pays for itself so fast that cash is meaningless.");
            Assert.Less(paybackSeconds, 600f, "An array takes too long to pay for itself to feel like progress.");
        }

        [Test]
        public void BargainArray_IsCheaperButWorse()
        {
            var standard = Load<SolarArrayDefinition>(StandardArrayPath);
            var bargain = Load<SolarArrayDefinition>(BargainArrayPath);

            Assert.Less(bargain.BuildCost, standard.BuildCost, "The bargain lot should be cheaper.");
            Assert.Less(bargain.NameplateMegawatts, standard.NameplateMegawatts, "The bargain lot should be weaker.");
            Assert.Greater(bargain.WearPerSecond, standard.WearPerSecond, "The bargain lot should be less reliable.");
        }

        [Test]
        public void Scenario_TargetIsReachableFromStartingCash()
        {
            var scenario = Load<ScenarioDefinition>(ScenarioPath);
            var array = Load<SolarArrayDefinition>(StandardArrayPath);

            int arraysNeeded = UnityEngine.Mathf.CeilToInt(scenario.TargetInstalledMegawatts / array.NameplateMegawatts);
            float cost = arraysNeeded * array.BuildCost;

            Assert.LessOrEqual(cost, scenario.StartingCash,
                $"The objective needs {arraysNeeded} arrays (${cost:0}) but the player starts with ${scenario.StartingCash:0}.");
        }

        [Test]
        public void SupplierEvent_ChoicesBothDoSomething()
        {
            var decisionEvent = Load<DecisionEventDefinition>(EventPath);

            Assert.IsNotEmpty(decisionEvent.ChoiceA.ResolvedLabel);
            Assert.IsNotEmpty(decisionEvent.ChoiceB.ResolvedLabel);

            bool choiceADoesSomething = decisionEvent.ChoiceA.SpawnsArray != null ||
                                        decisionEvent.ChoiceA.ConditionBonusToAllEquipment > 0f;
            bool choiceBDoesSomething = decisionEvent.ChoiceB.SpawnsArray != null ||
                                        decisionEvent.ChoiceB.ConditionBonusToAllEquipment > 0f;

            Assert.IsTrue(choiceADoesSomething, "Choice A charges the player but has no effect.");
            Assert.IsTrue(choiceBDoesSomething, "Choice B promises an effect but has none.");
        }

        [Test]
        public void SupplierEvent_LabelsResolveTheirTokens()
        {
            var decisionEvent = Load<DecisionEventDefinition>(EventPath);

            Assert.IsFalse(decisionEvent.ChoiceA.ResolvedLabel.Contains("{"), "Choice A label has an unresolved token.");
            Assert.IsFalse(decisionEvent.ChoiceB.ResolvedLabel.Contains("{"), "Choice B label has an unresolved token.");
        }
    }
}
