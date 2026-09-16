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

        public bool IsComplete => completed;

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

        private void OnGUI()
        {
            float installed = PowerBoard.InstalledMegawatts;
            GUI.Box(new Rect(Screen.width - 268f, 12f, 256f, completed ? 94f : 72f), GUIContent.none);
            GUI.Label(new Rect(Screen.width - 256f, 20f, 236f, 22f), "Objective: build solar capacity");
            GUI.Label(new Rect(Screen.width - 256f, 42f, 236f, 22f), $"Installed {installed:0.00} / {targetInstalledMegawatts:0.00} MW");
            if (completed)
            {
                GUI.Label(new Rect(Screen.width - 256f, 64f, 236f, 22f), "WIN — Tiny Tycoon!");
            }
        }
    }
}
