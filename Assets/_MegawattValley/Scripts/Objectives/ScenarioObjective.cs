using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Tiny scenario objective + win state (S5-04 / S5-05).
    /// </summary>
    public sealed class ScenarioObjective : MonoBehaviour
    {
        /// <summary>
        /// Measured against installed nameplate capacity, not instantaneous output, so the target
        /// stays reachable at any time of day and any equipment condition.
        /// </summary>
        [SerializeField] private float targetInstalledMegawatts = 0.75f;
        [SerializeField] private bool completed;

        public static ScenarioObjective Instance { get; private set; }

        public bool IsComplete => completed;
        public float TargetInstalledMegawatts => targetInstalledMegawatts;
        public string Description => $"Reach {targetInstalledMegawatts:0.00} MW installed";

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
            if (completed)
            {
                return;
            }

            if (PowerBoard.InstalledMegawatts >= targetInstalledMegawatts)
            {
                completed = true;
                Debug.Log($"[MegawattValley] OBJECTIVE COMPLETE: {targetInstalledMegawatts:0.00} MW installed. Tiny Tycoon win!");
            }
        }

    }
}
