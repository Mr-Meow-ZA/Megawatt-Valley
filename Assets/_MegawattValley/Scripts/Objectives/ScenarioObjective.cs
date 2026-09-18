using MegawattValley.Data;
using MegawattValley.Persistence;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MegawattValley.Core
{
    /// <summary>
    /// One-star scenario clear: install target MW before the day deadline (L1-05).
    /// </summary>
    public sealed class ScenarioObjective : MonoBehaviour
    {
        [SerializeField] private ScenarioDefinition scenario;

        /// <summary>
        /// Measured against installed nameplate capacity, not instantaneous output, so the target
        /// stays reachable at any time of day and any equipment condition.
        /// </summary>
        [SerializeField] private float fallbackTargetMegawatts = 0.75f;
        [SerializeField] private int fallbackFailAfterDay = 8;
        [SerializeField] private bool completed;
        [SerializeField] private bool failed;

        public static ScenarioObjective Instance { get; private set; }

        public ScenarioDefinition Scenario => scenario;

        public bool IsComplete => completed;
        public bool IsFailed => failed;
        public bool IsTerminal => completed || failed;

        public float TargetInstalledMegawatts => scenario != null
            ? scenario.TargetInstalledMegawatts
            : fallbackTargetMegawatts;

        public int FailAfterDay => scenario != null
            ? scenario.FailAfterDay
            : fallbackFailAfterDay;

        public string Description => scenario != null
            ? $"{scenario.ObjectiveSummary}"
            : "Build solar capacity";

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

        /// <summary>Used when restoring a saved game.</summary>
        public void SetCompleted(bool value)
        {
            completed = value;
            if (completed)
            {
                failed = false;
            }
        }

        public void SetFailed(bool value)
        {
            failed = value;
            if (failed)
            {
                completed = false;
            }
        }

        /// <summary>Reload the active scene for a clean one-star attempt.</summary>
        public void RestartScenario()
        {
            SaveGameService.Instance?.DeleteSave();
            var scene = SceneManager.GetActiveScene();
            if (scene.buildIndex >= 0)
            {
                SceneManager.LoadScene(scene.buildIndex);
            }
            else
            {
                SceneManager.LoadScene(scene.name);
            }
        }

        private void Update()
        {
            if (IsTerminal)
            {
                return;
            }

            if (PowerBoard.InstalledMegawatts >= TargetInstalledMegawatts)
            {
                completed = true;
                SimulationClock.Instance?.SetSpeedIndex(0);
                Debug.Log($"[MegawattValley] 1★ CLEAR: {TargetInstalledMegawatts:0.00} MW installed.");
                return;
            }

            int day = DayNightSun.Instance != null ? DayNightSun.Instance.DayNumber : 1;
            if (day >= FailAfterDay)
            {
                failed = true;
                SimulationClock.Instance?.SetSpeedIndex(0);
                Debug.Log($"[MegawattValley] SCENARIO FAILED: day {day} reached without {TargetInstalledMegawatts:0.00} MW.");
            }
        }
    }
}
