using System;
using System.Collections.Generic;
using System.IO;
using MegawattValley.Construction;
using MegawattValley.Core;
using MegawattValley.Data;
using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Persistence
{
    [Serializable]
    public sealed class SavedArray
    {
        public string definitionName;
        public Vector3 position;
        public float yaw;
        public float condition;
        public bool faulted;
    }

    [Serializable]
    public sealed class SaveFile
    {
        public int version = 3;
        public float cash;
        public float lifetimeRevenue;
        public int dayNumber = 1;
        public float timeOfDay = 0.5f;
        public bool objectiveCompleted;
        public bool twoStar;
        public bool threeStar;
        public int repairsCompleted;
        public List<string> unlockedCapabilities = new List<string>();
        public List<SavedArray> arrays = new List<SavedArray>();
    }

    /// <summary>
    /// Save / load stub (S6-06 / L1-07 / E1): cash, revenue, stars, capabilities, arrays, clock.
    /// </summary>
    public sealed class SaveGameService : MonoBehaviour
    {
        public const int CurrentVersion = 3;

        [Tooltip("Array products the loader can rebuild. A save referencing anything else is skipped.")]
        [SerializeField] private SolarArrayDefinition[] knownArrays = Array.Empty<SolarArrayDefinition>();
        [SerializeField] private string fileName = "prototype_valley_save.json";

        public static SaveGameService Instance { get; private set; }

        /// <summary>Short result of the last save or load, for the HUD.</summary>
        public string LastMessage { get; private set; } = string.Empty;

        public bool SaveExists => File.Exists(SavePath);

        private string SavePath => Path.Combine(Application.persistentDataPath, fileName);

        private void Awake()
        {
            Instance = this;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void Update()
        {
            var keyboard = Keyboard.current;
            if (keyboard == null)
            {
                return;
            }

            if (keyboard.f5Key.wasPressedThisFrame)
            {
                Save();
            }

            if (keyboard.f9Key.wasPressedThisFrame)
            {
                Load();
            }
        }

        public void Save()
        {
            var file = new SaveFile
            {
                version = CurrentVersion,
                cash = PlayerEconomy.Instance != null ? PlayerEconomy.Instance.Cash : 0f,
                lifetimeRevenue = PlayerEconomy.Instance != null ? PlayerEconomy.Instance.LifetimeRevenue : 0f,
                dayNumber = DayNightSun.Instance != null ? DayNightSun.Instance.DayNumber : 1,
                timeOfDay = DayNightSun.Instance != null ? DayNightSun.Instance.TimeOfDay : 0.5f,
                objectiveCompleted = ScenarioObjective.Instance != null && ScenarioObjective.Instance.HasOneStar,
                twoStar = ScenarioObjective.Instance != null && ScenarioObjective.Instance.HasTwoStar,
                threeStar = ScenarioObjective.Instance != null && ScenarioObjective.Instance.HasThreeStar,
                repairsCompleted = ScenarioObjective.Instance != null ? ScenarioObjective.Instance.RepairsCompleted : 0,
                unlockedCapabilities = CompanyCapabilities.Instance != null
                    ? new List<string>(CompanyCapabilities.Instance.UnlockedIds)
                    : new List<string>()
            };

            foreach (var unit in PowerBoard.All)
            {
                var definition = unit.Definition;
                if (definition == null)
                {
                    // Without a definition the loader cannot rebuild it, so do not pretend it saved.
                    Debug.LogWarning($"[MegawattValley] Skipping {unit.name} in save: no array definition assigned.");
                    continue;
                }

                var condition = unit.GetComponent<EquipmentCondition>();
                file.arrays.Add(new SavedArray
                {
                    definitionName = definition.name,
                    position = unit.transform.position,
                    yaw = unit.transform.eulerAngles.y,
                    condition = condition != null ? condition.Condition : 100f,
                    faulted = condition != null && condition.IsFaulted
                });
            }

            try
            {
                File.WriteAllText(SavePath, JsonUtility.ToJson(file, prettyPrint: true));
                LastMessage = $"Saved {file.arrays.Count} array(s)";
                Debug.Log($"[MegawattValley] Saved to {SavePath}");
            }
            catch (Exception exception)
            {
                LastMessage = "Save failed";
                Debug.LogError($"[MegawattValley] Save failed: {exception.Message}");
            }
        }

        public void Load()
        {
            if (!SaveExists)
            {
                LastMessage = "No save file yet";
                Debug.LogWarning($"[MegawattValley] No save file at {SavePath}");
                return;
            }

            SaveFile file;
            try
            {
                file = JsonUtility.FromJson<SaveFile>(File.ReadAllText(SavePath));
            }
            catch (Exception exception)
            {
                LastMessage = "Save file unreadable";
                Debug.LogError($"[MegawattValley] Load failed: {exception.Message}");
                return;
            }

            if (file == null)
            {
                LastMessage = "Save file empty";
                Debug.LogError("[MegawattValley] Load failed: save file contained no data.");
                return;
            }

            if (file.version != CurrentVersion)
            {
                LastMessage = $"Save is version {file.version}, expected {CurrentVersion}";
                Debug.LogWarning($"[MegawattValley] Refusing to load save version {file.version}.");
                return;
            }

            ClearPlacedArrays();

            if (PlayerEconomy.Instance != null)
            {
                PlayerEconomy.Instance.SetCash(file.cash);
                PlayerEconomy.Instance.SetLifetimeRevenue(file.lifetimeRevenue);
            }

            if (DayNightSun.Instance != null)
            {
                DayNightSun.Instance.SetClock(file.dayNumber, file.timeOfDay);
            }

            if (ScenarioObjective.Instance != null)
            {
                ScenarioObjective.Instance.SetRepairsCompleted(file.repairsCompleted);
                ScenarioObjective.Instance.SetStars(file.objectiveCompleted, file.twoStar, file.threeStar);
            }

            if (CompanyCapabilities.Instance != null)
            {
                CompanyCapabilities.Instance.SetUnlockedIds(file.unlockedCapabilities);
            }

            SelectablePlot.RestoreUnlockState(file.objectiveCompleted);

            int restored = 0;
            if (file.arrays != null)
            {
                foreach (var saved in file.arrays)
                {
                    var definition = FindDefinition(saved.definitionName);
                    if (definition == null)
                    {
                        Debug.LogWarning($"[MegawattValley] Save references unknown array '{saved.definitionName}'. Skipped.");
                        continue;
                    }

                    var array = SolarArrayFactory.CreateArray(definition, saved.position, saved.yaw);
                    var condition = array.GetComponent<EquipmentCondition>();
                    if (condition != null)
                    {
                        condition.RestoreState(saved.condition, saved.faulted);
                    }

                    restored++;
                }
            }

            LastMessage = $"Loaded {restored} array(s)";
            Debug.Log($"[MegawattValley] Loaded save from {SavePath} ({restored} array(s)).");
        }

        /// <summary>Removes the on-disk save so a scenario restart starts clean.</summary>
        public void DeleteSave()
        {
            try
            {
                if (File.Exists(SavePath))
                {
                    File.Delete(SavePath);
                }

                LastMessage = "Save cleared";
            }
            catch (Exception exception)
            {
                LastMessage = "Could not clear save";
                Debug.LogWarning($"[MegawattValley] DeleteSave failed: {exception.Message}");
            }
        }

        private static void ClearPlacedArrays()
        {
            EquipmentCondition.ClearSelection();

            // Copy first: destroying units mutates the board's list.
            var existing = new List<SolarArrayUnit>(PowerBoard.All);
            foreach (var unit in existing)
            {
                if (unit == null)
                {
                    continue;
                }

                // Destroy() is deferred to end of frame, which would leave the old arrays counted
                // in installed capacity alongside the restored ones. Deactivating first runs
                // OnDisable now, so the power and maintenance boards drop them immediately.
                unit.gameObject.SetActive(false);
                Destroy(unit.gameObject);
            }
        }

        private SolarArrayDefinition FindDefinition(string definitionName)
        {
            if (string.IsNullOrEmpty(definitionName))
            {
                return null;
            }

            foreach (var candidate in knownArrays)
            {
                if (candidate != null && candidate.name == definitionName)
                {
                    return candidate;
                }
            }

            return null;
        }
    }
}
