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
        public const string EventBirdPath = DataFolder + "/Event_BirdStrikeBriefing.asset";
        public const string EventGridPath = DataFolder + "/Event_GridCurtailmentMemo.asset";
        public const string EventInfluencerPath = DataFolder + "/Event_InfluencerTour.asset";
        public const string EventNightPath = DataFolder + "/Event_NightShiftDonuts.asset";
        public const string EventHailPath = DataFolder + "/Event_HailForecast.asset";

        [MenuItem("Megawatt Valley/Create Missing Content Assets")]
        public static void EnsureAll()
        {
            EnsureStandardArray();
            EnsureBargainArray();
            EnsureSupplierEvent();
            EnsureBirdEvent();
            EnsureGridEvent();
            EnsureInfluencerEvent();
            EnsureNightEvent();
            EnsureHailClimax();
            EnsureScenario();
            AssetDatabase.SaveAssets();
        }

        public static DecisionEventDefinition[] EnsureEventDeck()
        {
            return new[]
            {
                EnsureSupplierEvent(),
                EnsureBirdEvent(),
                EnsureGridEvent(),
                EnsureInfluencerEvent(),
                EnsureNightEvent()
            };
        }

        public static SolarArrayDefinition EnsureStandardArray()
        {
            var existing = AssetDatabase.LoadAssetAtPath<SolarArrayDefinition>(StandardArrayPath);
            if (existing != null)
            {
                var patch = new SerializedObject(existing);
                var name = patch.FindProperty("displayName");
                if (name != null && name.stringValue == "Solar Array")
                {
                    name.stringValue = "Premium Array";
                    patch.FindProperty("blurb").stringValue = "Solid fixed-tilt table. Costs more, lasts longer.";
                    patch.ApplyModifiedPropertiesWithoutUndo();
                }

                return existing;
            }

            var asset = ScriptableObject.CreateInstance<SolarArrayDefinition>();
            AssetDatabase.CreateAsset(asset, StandardArrayPath);

            var editable = new SerializedObject(asset);
            editable.FindProperty("displayName").stringValue = "Premium Array";
            editable.FindProperty("blurb").stringValue = "Solid fixed-tilt table. Costs more, lasts longer.";
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
                var patch = new SerializedObject(existing);
                var trigger = patch.FindProperty("triggerAfterSeconds");
                if (trigger != null && trigger.floatValue < 60f)
                {
                    trigger.floatValue = 90f;
                    patch.ApplyModifiedPropertiesWithoutUndo();
                }

                return existing;
            }

            var asset = ScriptableObject.CreateInstance<DecisionEventDefinition>();
            AssetDatabase.CreateAsset(asset, SupplierEventPath);

            var editable = new SerializedObject(asset);
            editable.FindProperty("title").stringValue = "Supplier Soft Pitch";
            editable.FindProperty("body").stringValue =
                "A salesman offers \"premium\" panels that look suspiciously like last year's stock with a fresh sticker. " +
                "He is already unloading them onto your access road.";
            editable.FindProperty("triggerAfterSeconds").floatValue = 90f;

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

        public static DecisionEventDefinition EnsureBirdEvent()
        {
            return EnsureSimpleEvent(
                EventBirdPath,
                "Bird Strike Briefing",
                "A flock of very confident starlings has been using your premium arrays as a landing strip. Ops wants a response.",
                55f,
                "Hire a polite falconer\n-${cost}",
                90f,
                0f,
                null,
                "A falcon named Kevin now patrols. The starlings file a complaint.",
                "Install shiny deterrents\n+{condition} site-wide wipe",
                0f,
                10f,
                "You hang CDs on string. It is ugly. It works. Kevin is unemployed.");
        }

        public static DecisionEventDefinition EnsureGridEvent()
        {
            return EnsureSimpleEvent(
                EventGridPath,
                "Grid Curtailment Memo",
                "The utility asks you to \"voluntarily\" dial back export this afternoon. Their emoji use is aggressive.",
                90f,
                "Comply cheerfully\nFree +{condition} maintenance window",
                0f,
                12f,
                null,
                "You curtail. The utility sends a thumbs-up sticker.",
                "Negotiate a tiny fee\n+${cost} cash (they pay you)",
                -40f,
                0f,
                "You extract a courtesy payment. The spreadsheet smiles.");
        }

        public static DecisionEventDefinition EnsureInfluencerEvent()
        {
            return EnsureSimpleEvent(
                EventInfluencerPath,
                "Influencer Site Tour",
                "A renewable-energy influencer wants to film \"Day in the Life: Megawatts\". They brought a drone and zero hard hats.",
                120f,
                "Host the tour\n-${cost} for PPE + coffee",
                60f,
                5f,
                null,
                "The video gets 12 likes. One is your mum.",
                "Politely decline\nKeep working",
                0f,
                0f,
                "You decline. Productivity remains undramatic and excellent.");
        }

        public static DecisionEventDefinition EnsureNightEvent()
        {
            return EnsureSimpleEvent(
                EventNightPath,
                "Night Shift Donuts",
                "Jordan found a bakery that sells \"inverter-glazed\" donuts at 2am. The crew is watching you.",
                150f,
                "Buy the box\n-${cost}, +{condition} morale wipe",
                45f,
                8f,
                null,
                "Donuts acquired. Condition mysteriously improves.",
                "Suggest fruit instead\nCrew mutiny averted (barely)",
                0f,
                0f,
                "You suggest apples. Jordan files this under \"leadership moments\".");
        }

        /// <summary>L1-06 climax: protect the plant vs ride out the hail.</summary>
        public static DecisionEventDefinition EnsureHailClimax()
        {
            var existing = AssetDatabase.LoadAssetAtPath<DecisionEventDefinition>(EventHailPath);
            if (existing != null)
            {
                return existing;
            }

            EnsureFolder(DataFolder);
            var asset = ScriptableObject.CreateInstance<DecisionEventDefinition>();
            AssetDatabase.CreateAsset(asset, EventHailPath);

            var editable = new SerializedObject(asset);
            editable.FindProperty("title").stringValue = "Severe Hail Forecast";
            editable.FindProperty("body").stringValue =
                "Met office just upgraded the afternoon cells to \"golf-ball adjacent\". " +
                "You can tarp the tables now, or keep exporting and hope the insurance forms are funny.";
            editable.FindProperty("triggerAfterSeconds").floatValue = 0f;

            var choiceA = editable.FindProperty("choiceA");
            choiceA.FindPropertyRelative("label").stringValue = "Deploy hail covers\n-${cost}, +{condition} protection";
            choiceA.FindPropertyRelative("cashCost").floatValue = 180f;
            choiceA.FindPropertyRelative("conditionBonusToAllEquipment").floatValue = 20f;
            choiceA.FindPropertyRelative("conditionPenaltyToAllEquipment").floatValue = 0f;
            choiceA.FindPropertyRelative("forceFaultOnAllEquipment").boolValue = false;
            choiceA.FindPropertyRelative("spawnsArray").objectReferenceValue = null;
            choiceA.FindPropertyRelative("resultLog").stringValue =
                "Covers deployed. Export dips while the crew cheers the thunder.";

            var choiceB = editable.FindProperty("choiceB");
            choiceB.FindPropertyRelative("label").stringValue = "Keep exporting\nNo cost — storm damage likely";
            choiceB.FindPropertyRelative("cashCost").floatValue = 0f;
            choiceB.FindPropertyRelative("conditionBonusToAllEquipment").floatValue = 0f;
            choiceB.FindPropertyRelative("conditionPenaltyToAllEquipment").floatValue = 35f;
            choiceB.FindPropertyRelative("forceFaultOnAllEquipment").boolValue = true;
            choiceB.FindPropertyRelative("spawnsArray").objectReferenceValue = null;
            choiceB.FindPropertyRelative("resultLog").stringValue =
                "You rode it out. Several tables now sound like broken biscuits.";

            editable.ApplyModifiedPropertiesWithoutUndo();
            Debug.Log($"[MegawattValley] Created {EventHailPath}.");
            return asset;
        }

        private static DecisionEventDefinition EnsureSimpleEvent(
            string path,
            string title,
            string body,
            float triggerSeconds,
            string labelA,
            float costA,
            float conditionA,
            SolarArrayDefinition spawnA,
            string resultA,
            string labelB,
            float costB,
            float conditionB,
            string resultB)
        {
            var existing = AssetDatabase.LoadAssetAtPath<DecisionEventDefinition>(path);
            if (existing != null)
            {
                return existing;
            }

            EnsureFolder(DataFolder);
            var asset = ScriptableObject.CreateInstance<DecisionEventDefinition>();
            AssetDatabase.CreateAsset(asset, path);

            var editable = new SerializedObject(asset);
            editable.FindProperty("title").stringValue = title;
            editable.FindProperty("body").stringValue = body;
            editable.FindProperty("triggerAfterSeconds").floatValue = triggerSeconds;

            var choiceA = editable.FindProperty("choiceA");
            choiceA.FindPropertyRelative("label").stringValue = labelA;
            choiceA.FindPropertyRelative("cashCost").floatValue = costA;
            choiceA.FindPropertyRelative("conditionBonusToAllEquipment").floatValue = conditionA;
            choiceA.FindPropertyRelative("spawnsArray").objectReferenceValue = spawnA;
            choiceA.FindPropertyRelative("resultLog").stringValue = resultA;

            var choiceB = editable.FindProperty("choiceB");
            choiceB.FindPropertyRelative("label").stringValue = labelB;
            choiceB.FindPropertyRelative("cashCost").floatValue = costB;
            choiceB.FindPropertyRelative("conditionBonusToAllEquipment").floatValue = conditionB;
            choiceB.FindPropertyRelative("spawnsArray").objectReferenceValue = null;
            choiceB.FindPropertyRelative("resultLog").stringValue = resultB;

            editable.ApplyModifiedPropertiesWithoutUndo();
            Debug.Log($"[MegawattValley] Created {path}.");
            return asset;
        }

        private static void EnsureFolder(string assetFolder)
        {
            if (AssetDatabase.IsValidFolder(assetFolder))
            {
                return;
            }

            string parent = System.IO.Path.GetDirectoryName(assetFolder)?.Replace('\\', '/');
            string leaf = System.IO.Path.GetFileName(assetFolder);
            if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
            {
                EnsureFolder(parent);
            }

            AssetDatabase.CreateFolder(parent, leaf);
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

                var failDay = patch.FindProperty("failAfterDay");
                if (failDay != null && failDay.intValue < 10)
                {
                    failDay.intValue = 10;
                    patch.ApplyModifiedPropertiesWithoutUndo();
                }

                var revenue3 = patch.FindProperty("lifetimeRevenueForThreeStars");
                if (revenue3 != null && revenue3.floatValue <= 0f)
                {
                    revenue3.floatValue = 350f;
                    patch.FindProperty("repairsForTwoStars").intValue = 1;
                    patch.FindProperty("twoStarSummary").stringValue = "Repair at least one faulted array";
                    patch.FindProperty("threeStarSummary").stringValue = "Earn $350 from export revenue";
                    patch.ApplyModifiedPropertiesWithoutUndo();
                    Debug.Log($"[MegawattValley] Patched star-tier fields on {ScenarioPath}.");
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
            editable.FindProperty("failAfterDay").intValue = 10;
            editable.FindProperty("repairsForTwoStars").intValue = 1;
            editable.FindProperty("lifetimeRevenueForThreeStars").floatValue = 350f;
            editable.FindProperty("twoStarSummary").stringValue = "Repair at least one faulted array";
            editable.FindProperty("threeStarSummary").stringValue = "Earn $350 from export revenue";
            editable.ApplyModifiedPropertiesWithoutUndo();

            Debug.Log($"[MegawattValley] Created {ScenarioPath}.");
            return asset;
        }
    }
}
