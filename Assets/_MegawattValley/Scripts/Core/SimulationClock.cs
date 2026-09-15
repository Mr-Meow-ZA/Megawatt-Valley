using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Pause / 1x / 2x / 3x simulation speed without freezing input (S3-05).
    /// </summary>
    public sealed class SimulationClock : MonoBehaviour
    {
        public static SimulationClock Instance { get; private set; }

        [SerializeField] private float[] speedSteps = { 0f, 1f, 2f, 3f };
        [SerializeField] private int speedIndex = 1;

        public float CurrentSpeed => speedSteps[Mathf.Clamp(speedIndex, 0, speedSteps.Length - 1)];
        public float SimulationDeltaTime => Time.unscaledDeltaTime * CurrentSpeed;

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

            if (keyboard.digit1Key.wasPressedThisFrame) SetSpeedIndex(1);
            if (keyboard.digit2Key.wasPressedThisFrame) SetSpeedIndex(2);
            if (keyboard.digit3Key.wasPressedThisFrame) SetSpeedIndex(3);
            if (keyboard.spaceKey.wasPressedThisFrame)
            {
                SetSpeedIndex(speedIndex == 0 ? 1 : 0);
            }
        }

        private void SetSpeedIndex(int index)
        {
            speedIndex = Mathf.Clamp(index, 0, speedSteps.Length - 1);
            Debug.Log($"[MegawattValley] Sim speed: {CurrentSpeed:0}x");
        }

        private void OnGUI()
        {
            GUI.Label(new Rect(12f, 84f, 220f, 24f), $"Speed: {CurrentSpeed:0}x  (Space pause, 1/2/3)");
            GUI.Label(new Rect(12f, 108f, 460f, 40f), "B build solar · R rotate · Esc cancel · X demolish · click plot to select");
        }
    }
}
