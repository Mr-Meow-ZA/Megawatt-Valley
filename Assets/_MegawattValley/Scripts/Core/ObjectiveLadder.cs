using MegawattValley.Data;
using UnityEngine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Short contextual objective beats for the opening scenario (E1-05).
    /// </summary>
    public sealed class ObjectiveLadder : MonoBehaviour
    {
        public static ObjectiveLadder Instance { get; private set; }

        public string CurrentBeatTitle { get; private set; } = "First Power";
        public string CurrentBeatBody { get; private set; } = "Place solar inside the cyan grid ring and watch EXPORT climb.";

        private int _beatIndex;
        private bool _placedArray;
        private bool _sawFaultPrompt;
        private bool _unlockedRadio;
        private bool _cleanedOnce;
        private bool _unlockedCleaningKit;
        private bool _unlockedSiteB;

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

        private void OnEnable()
        {
            if (CompanyCapabilities.Instance != null)
            {
                CompanyCapabilities.Instance.CapabilityUnlocked += OnCapabilityUnlocked;
            }
        }

        private void OnDisable()
        {
            if (CompanyCapabilities.Instance != null)
            {
                CompanyCapabilities.Instance.CapabilityUnlocked -= OnCapabilityUnlocked;
            }
        }

        private void Update()
        {
            if (PowerBoard.InstalledMegawatts > 0.01f)
            {
                _placedArray = true;
            }

            if (MaintenanceBoard.FaultedCount > 0)
            {
                _sawFaultPrompt = true;
            }

            if (ScenarioObjective.Instance != null && ScenarioObjective.Instance.HasOneStar)
            {
                _unlockedSiteB = true;
            }

            RefreshBeat();
        }

        public void NotifyCleaned()
        {
            _cleanedOnce = true;
        }

        private void OnCapabilityUnlocked(string id)
        {
            if (id == CapabilityIds.RadioDispatch)
            {
                _unlockedRadio = true;
            }

            if (id == CapabilityIds.BasicCleaningKit)
            {
                _unlockedCleaningKit = true;
            }
        }

        private void RefreshBeat()
        {
            var caps = CompanyCapabilities.Instance;
            bool radio = caps != null && caps.IsUnlocked(CapabilityIds.RadioDispatch);
            bool kit = caps != null && caps.IsUnlocked(CapabilityIds.BasicCleaningKit);

            if (!_placedArray)
            {
                SetBeat(0, "First Power", "Place solar inside the cyan grid ring and watch EXPORT climb.");
                return;
            }

            if (!radio)
            {
                SetBeat(1, "First Failure",
                    _sawFaultPrompt
                        ? "Select the faulted array and press F / Repair to dispatch Jordan manually."
                        : "Force a fault (select array, press K) then dispatch Jordan with F.");
                return;
            }

            if (!_unlockedRadio && radio)
            {
                _unlockedRadio = true;
            }

            if (!_cleanedOnce)
            {
                SetBeat(2, "Dust Happens", "Arrays get dusty. Select one and press Clean (C) to restore output.");
                return;
            }

            if (!kit)
            {
                SetBeat(3, "Cleaning Kit", "Clean once more to unlock the Basic Cleaning Kit (faster cleans).");
                return;
            }

            if (!_unlockedSiteB)
            {
                SetBeat(4, "Growing Up", "Hit 1★ (0.75 MW) to unlock Site B east of the main pad.");
                return;
            }

            SetBeat(5, "Keep Climbing", "Chase 2★ (repair) and 3★ (export revenue). Hail may hit late.");
        }

        private void SetBeat(int index, string title, string body)
        {
            _beatIndex = index;
            CurrentBeatTitle = title;
            CurrentBeatBody = body;
        }
    }
}
