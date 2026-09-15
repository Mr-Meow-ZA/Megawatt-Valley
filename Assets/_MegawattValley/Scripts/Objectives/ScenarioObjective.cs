using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Tiny scenario objective + win state (S5-04 / S5-05).
    /// </summary>
    public sealed class ScenarioObjective : MonoBehaviour
    {
        [SerializeField] private float targetMegawatts = 0.5f;
        [SerializeField] private bool completed;

        public bool IsComplete => completed;

        private void Update()
        {
            if (completed)
            {
                return;
            }

            if (PowerBoard.TotalMegawatts >= targetMegawatts)
            {
                completed = true;
                Debug.Log($"[MegawattValley] OBJECTIVE COMPLETE: Reach {targetMegawatts:0.00} MW. Tiny Tycoon win!");
            }
        }

        private void OnGUI()
        {
            float current = PowerBoard.TotalMegawatts;
            GUI.Box(new Rect(Screen.width - 260f, 12f, 248f, completed ? 72f : 56f), GUIContent.none);
            GUI.Label(new Rect(Screen.width - 248f, 20f, 230f, 24f), $"Objective: {current:0.00} / {targetMegawatts:0.00} MW");
            if (completed)
            {
                GUI.Label(new Rect(Screen.width - 248f, 44f, 230f, 24f), "WIN — Tiny Tycoon!");
            }
        }
    }
}
