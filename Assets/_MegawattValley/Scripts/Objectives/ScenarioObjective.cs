using MegawattValley.Data;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Tiny scenario objective + win state (S5-04 / S5-05), driven by scenario data (S6-04).
    /// </summary>
    public sealed class ScenarioObjective : MonoBehaviour
    {
        [SerializeField] private ScenarioDefinition scenario;

        /// <summary>
        /// Measured against installed nameplate capacity, not instantaneous output, so the target
        /// stays reachable at any time of day and any equipment condition.
        /// </summary>
        [SerializeField] private float fallbackTargetMegawatts = 0.75f;
        [SerializeField] private bool completed;

        public static ScenarioObjective Instance { get; private set; }

        /// <summary>Active scenario data, if this objective is wired to a definition.</summary>
        public ScenarioDefinition Scenario => scenario;

        public bool IsComplete => completed;

        public float TargetInstalledMegawatts => scenario != null
            ? scenario.TargetInstalledMegawatts
            : fallbackTargetMegawatts;

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
        }

        private void Update()
        {
            if (completed)
            {
                return;
            }

            if (PowerBoard.InstalledMegawatts >= TargetInstalledMegawatts)
            {
                completed = true;
                Debug.Log($"[MegawattValley] OBJECTIVE COMPLETE: {TargetInstalledMegawatts:0.00} MW installed. Tiny Tycoon win!");
            }
        }
    }
}
