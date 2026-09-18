using MegawattValley.Persistence;
using NUnit.Framework;
using UnityEngine;

namespace MegawattValley.Tests
{
    /// <summary>
    /// The save stub relies on JsonUtility, which silently drops anything it cannot serialise.
    /// These tests prove a populated save survives a round trip (S6-06).
    /// </summary>
    public sealed class SaveFileTests
    {
        private const float Tolerance = 0.0001f;

        private static SaveFile BuildPopulatedSave()
        {
            var file = new SaveFile
            {
                version = SaveGameService.CurrentVersion,
                cash = 742.5f,
                lifetimeRevenue = 210f,
                dayNumber = 3,
                timeOfDay = 0.25f,
                objectiveCompleted = true,
                twoStar = true,
                threeStar = false,
                repairsCompleted = 2
            };

            file.arrays.Add(new SavedArray
            {
                definitionName = "Solar_StandardArray",
                position = new Vector3(2.5f, 0f, -4f),
                yaw = 90f,
                condition = 61.5f,
                faulted = false
            });

            file.arrays.Add(new SavedArray
            {
                definitionName = "Solar_BargainLot",
                position = new Vector3(-6f, 0f, 1.5f),
                yaw = 270f,
                condition = 12f,
                faulted = true
            });

            return file;
        }

        [Test]
        public void SaveFile_SurvivesAJsonRoundTrip()
        {
            var original = BuildPopulatedSave();
            var restored = JsonUtility.FromJson<SaveFile>(JsonUtility.ToJson(original));

            Assert.IsNotNull(restored);
            Assert.AreEqual(original.version, restored.version);
            Assert.AreEqual(original.cash, restored.cash, Tolerance);
            Assert.AreEqual(original.dayNumber, restored.dayNumber);
            Assert.AreEqual(original.timeOfDay, restored.timeOfDay, Tolerance);
            Assert.AreEqual(original.objectiveCompleted, restored.objectiveCompleted);
            Assert.AreEqual(original.lifetimeRevenue, restored.lifetimeRevenue, Tolerance);
            Assert.AreEqual(original.twoStar, restored.twoStar);
            Assert.AreEqual(original.threeStar, restored.threeStar);
            Assert.AreEqual(original.repairsCompleted, restored.repairsCompleted);
        }

        [Test]
        public void SavedArrays_KeepPlacementAndWear()
        {
            var original = BuildPopulatedSave();
            var restored = JsonUtility.FromJson<SaveFile>(JsonUtility.ToJson(original));

            Assert.AreEqual(2, restored.arrays.Count);

            for (int i = 0; i < original.arrays.Count; i++)
            {
                Assert.AreEqual(original.arrays[i].definitionName, restored.arrays[i].definitionName);
                Assert.AreEqual(original.arrays[i].position.x, restored.arrays[i].position.x, Tolerance);
                Assert.AreEqual(original.arrays[i].position.z, restored.arrays[i].position.z, Tolerance);
                Assert.AreEqual(original.arrays[i].yaw, restored.arrays[i].yaw, Tolerance);
                Assert.AreEqual(original.arrays[i].condition, restored.arrays[i].condition, Tolerance);
                Assert.AreEqual(original.arrays[i].faulted, restored.arrays[i].faulted);
            }
        }

        [Test]
        public void EmptySave_RoundTripsWithoutArrays()
        {
            var restored = JsonUtility.FromJson<SaveFile>(JsonUtility.ToJson(new SaveFile()));

            Assert.IsNotNull(restored.arrays);
            Assert.AreEqual(0, restored.arrays.Count);
        }
    }
}
