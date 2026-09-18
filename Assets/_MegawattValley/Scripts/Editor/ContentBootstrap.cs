using MegawattValley.Data;
using UnityEditor;
using UnityEngine;

namespace MegawattValley.EditorTools
{
    /// <summary>
    /// Creates the first ScriptableObject content pack (S6-04).
    ///
    /// Assets are only written when missing. Once an asset exists it belongs to whoever is
    /// balancing the game, so re-running this must never overwrite hand-tuned values.
    /// </summary>
    public static class ContentBootstrap
    {
        public const string DataFolder = "Assets/_MegawattValley/Data";
        public const string StandardArrayPath = DataFolder + "/Solar_StandardArray.asset";
        public const string BargainArrayPath = DataFolder + "/Solar_BargainLot.asset";
        public const string SupplierEventPath = DataFolder + "/Event_SupplierSoftPitch.asset";
        public const string ScenarioPath = DataFolder + "/Scenario_PrototypeValley.asset";

        [MenuItem("Megawatt Valley/Create Missing Content Assets")]
        public static void EnsureAll()
        {
            EnsureStandardArray();
            EnsureBargainArray();
            EnsureSupplierEvent();
            EnsureScenario();
            AssetDatabase.SaveAssets();
        }

        public static SolarArrayDefinition EnsureStandardArray()
        {
            var existing = AssetDatabase.LoadAssetAtPath<SolarArrayDefinition>(StandardArrayPath);
            if (existing != null)
            {
                return existing;
            }

            var asset = ScriptableObject.CreateInstance<SolarArrayDefinition>();
            AssetDatabase.CreateAsset(asset, StandardArrayPath);

            var editable = new SerializedObject(asset);
            editable.FindProperty("displayName").stringValue = "Solar Array";
            editable.FindProperty("blurb").stringValue = "Standard fixed-tilt table. Boring, reliable, pays for itself.";
            editable.FindProperty("buildCost").floatValue = 250f;
            editable.FindProperty("revenuePerMwPerSecond").floatValue = 8f;
            editable.FindProperty("demolishRefundFraction").floatValue = 0.5f;
            editable.FindProperty("nameplateMegawatts").floatValue = 0.25f;
            editable.FindProperty("footprint").vector3Value = new Vector3(4f, 0.4f, 2f);
            editable.FindProperty("bodyColor").colorValue = new Color(0.15f, 0.35f, 0.7f);
            editable.FindProperty("wearPerSecond").floatValue = 0.1f;
            editable.FindProperty("faultChancePerSecondAtLowCondition").floatValue = 0.06f;
            editable.FindProperty("repairCost").floatValue = 80f;
            editable.FindProperty("preventiveCost").floatValue = 35f;
            editable.FindProperty("repairSeconds").floatValue = 2.5f;
            editable.ApplyModifiedPropertiesWithoutUndo();

            Debug.Log($"[MegawattValley] Created {StandardArrayPath}.");
            return asset;
        }

        public static SolarArrayDefinition EnsureBargainArray()
        {
            var existing = AssetDatabase.LoadAssetAtPath<SolarArrayDefinition>(BargainArrayPath);
            if (existing != null)
            {
                return existing;
            }

            var asset = ScriptableObject.CreateInstance<SolarArrayDefinition>();
            AssetDatabase.CreateAsset(asset, BargainArrayPath);

            // Cheaper per array, but less capacity and noticeably worse reliability.
            var editable = new SerializedObject(asset);
            editable.FindProperty("displayName").stringValue = "Bargain Lot Array";
            editable.FindProperty("blurb").stringValue = "Last year's stock with a fresh sticker.";
            editable.FindProperty("buildCost").floatValue = 120f;
            editable.FindProperty("revenuePerMwPerSecond").floatValue = 8f;
            editable.FindProperty("demolishRefundFraction").floatValue = 0.3f;
            editable.FindProperty("nameplateMegawatts").floatValue = 0.15f;
            editable.FindProperty("footprint").vector3Value = new Vector3(4f, 0.4f, 2f);
            editable.FindProperty("bodyColor").colorValue = new Color(0.3f, 0.3f, 0.42f);
            editable.FindProperty("wearPerSecond").floatValue = 0.22f;
            editable.FindProperty("faultChancePerSecondAtLowCondition").floatValue = 0.12f;
            editable.FindProperty("repairCost").floatValue = 80f;
            editable.FindProperty("preventiveCost").floatValue = 35f;
            editable.FindProperty("repairSeconds").floatValue = 3.5f;
            editable.ApplyModifiedPropertiesWithoutUndo();

            Debug.Log($"[MegawattValley] Created {BargainArrayPath}.");
            return asset;
        }

        public static DecisionEventDefinition EnsureSupplierEvent()
        {
            var existing = AssetDatabase.LoadAssetAtPath<DecisionEventDefinition>(SupplierEventPath);
            if (existing != null)
            {
                return existing;
            }

            var asset = ScriptableObject.CreateInstance<DecisionEventDefinition>();
            AssetDatabase.CreateAsset(asset, SupplierEventPath);

            var editable = new SerializedObject(asset);
            editable.FindProperty("title").stringValue = "Supplier Soft Pitch";
            editable.FindProperty("body").stringValue =
                "A salesman offers \"premium\" panels that look suspiciously like last year's stock with a fresh sticker. " +
                "He is already unloading them onto your access road.";
            editable.FindProperty("triggerAfterSeconds").floatValue = 25f;

            var choiceA = editable.FindProperty("choiceA");
            choiceA.FindPropertyRelative("label").stringValue = "Buy the bargain lot\n-${cost} for {mw} MW";
            choiceA.FindPropertyRelative("cashCost").floatValue = 120f;
            choiceA.FindPropertyRelative("conditionBonusToAllEquipment").floatValue = 0f;
            choiceA.FindPropertyRelative("spawnsArray").objectReferenceValue = EnsureBargainArray();
            choiceA.FindPropertyRelative("spawnPosition").vector3Value = new Vector3(4f, 0f, 2f);
            choiceA.FindPropertyRelative("resultLog").stringValue =
                "You bought the sticker-premium panels. The spreadsheet is optimistic.";

            var choiceB = editable.FindProperty("choiceB");
            choiceB.FindPropertyRelative("label").stringValue = "Politely decline\nFree panel wipe, +{condition} condition";
            choiceB.FindPropertyRelative("cashCost").floatValue = 0f;
            choiceB.FindPropertyRelative("conditionBonusToAllEquipment").floatValue = 8f;
            choiceB.FindPropertyRelative("spawnsArray").objectReferenceValue = null;
            choiceB.FindPropertyRelative("resultLog").stringValue =
                "You decline. The technician wipes down the arrays out of sheer relief.";

            editable.ApplyModifiedPropertiesWithoutUndo();

            Debug.Log($"[MegawattValley] Created {SupplierEventPath}.");
            return asset;
        }

        public static ScenarioDefinition EnsureScenario()
        {
            var existing = AssetDatabase.LoadAssetAtPath<ScenarioDefinition>(ScenarioPath);
            if (existing != null)
            {
                // New L1-02 field: Unity defaults brand-new floats to 0, which would zero revenue.
                var patch = new SerializedObject(existing);
                var tariff = patch.FindProperty("exportTariffPerMwPerSecond");
                if (tariff != null && tariff.floatValue <= 0f)
                {
                    tariff.floatValue = 8f;
                    patch.ApplyModifiedPropertiesWithoutUndo();
                    Debug.Log($"[MegawattValley] Patched export tariff on {ScenarioPath}.");
                }

                return existing;
            }

            var asset = ScriptableObject.CreateInstance<ScenarioDefinition>();
            AssetDatabase.CreateAsset(asset, ScenarioPath);

            var editable = new SerializedObject(asset);
            editable.FindProperty("scenarioName").stringValue = "Sunny Slope — Site A";
            editable.FindProperty("objectiveSummary").stringValue = "Install 0.75 MW of solar";
            editable.FindProperty("startingCash").floatValue = 1000f;
            editable.FindProperty("exportTariffPerMwPerSecond").floatValue = 8f;
            editable.FindProperty("targetInstalledMegawatts").floatValue = 0.75f;
            editable.ApplyModifiedPropertiesWithoutUndo();

            Debug.Log($"[MegawattValley] Created {ScenarioPath}.");
            return asset;
        }
    }
}
