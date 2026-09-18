using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Core
{
    /// <summary>
    /// Pause / 1x / 2x / 3x simulation speed without freezing input (S3-05).
    /// Modal pause freezes the clock while decision events are on screen.
    /// </summary>
    public sealed class SimulationClock : MonoBehaviour
    {
        public static SimulationClock Instance { get; private set; }

        [SerializeField] private float[] speedSteps = { 0f, 1f, 2f, 3f };
        [SerializeField] private int speedIndex = 1;

        private int _speedBeforeModal = 1;
        private bool _modalPaused;

        public float CurrentSpeed => speedSteps[Mathf.Clamp(speedIndex, 0, speedSteps.Length - 1)];
        public float SimulationDeltaTime => Time.unscaledDeltaTime * CurrentSpeed;
        public int SpeedIndex => Mathf.Clamp(speedIndex, 0, speedSteps.Length - 1);
        public int SpeedStepCount => speedSteps.Length;
        public bool IsPaused => CurrentSpeed <= 0f;
        public bool IsModalPaused => _modalPaused;

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
            if (_modalPaused)
            {
                return;
            }

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
                TogglePause();
            }
        }

        public void SetSpeedIndex(int index)
        {
            if (_modalPaused)
            {
                return;
            }

            speedIndex = Mathf.Clamp(index, 0, speedSteps.Length - 1);
            Debug.Log($"[MegawattValley] Sim speed: {CurrentSpeed:0}x");
        }

        public void TogglePause()
        {
            if (_modalPaused)
            {
                return;
            }

            SetSpeedIndex(speedIndex == 0 ? 1 : 0);
        }

        /// <summary>Freeze sim while the player reads a decision event; restores prior speed on End.</summary>
        public void BeginModalPause()
        {
            if (_modalPaused)
            {
                return;
            }

            _speedBeforeModal = speedIndex == 0 ? 1 : speedIndex;
            _modalPaused = true;
            speedIndex = 0;
            Debug.Log("[MegawattValley] Sim paused for event.");
        }

        public void EndModalPause()
        {
            if (!_modalPaused)
            {
                return;
            }

            _modalPaused = false;
            speedIndex = Mathf.Clamp(_speedBeforeModal, 0, speedSteps.Length - 1);
            Debug.Log($"[MegawattValley] Sim resumed after event ({CurrentSpeed:0}x).");
        }
    }
}
