using MegawattValley.Core;
using MegawattValley.Persistence;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UIElements;

namespace MegawattValley.UI
{
    /// <summary>
    /// Drives the UI Toolkit HUD: company, power, time, objective, selection, build bar and events (S6-03).
    /// The HUD only reads simulation state and calls existing public methods; it owns no game rules.
    /// </summary>
    [RequireComponent(typeof(UIDocument))]
    public sealed class HudController : MonoBehaviour
    {
        [SerializeField] private float refreshInterval = 0.1f;

        private UIDocument _document;
        private VisualElement _root;

        private Label _cashValue;
        private Label _incomeValue;
        private Label _exportValue;
        private Label _installedValue;
        private Label _clockValue;
        private Label _sunValue;
        private Label _objectiveTitle;
        private Label _objectiveValue;
        private VisualElement _objectiveFill;
        private Label _objectiveWin;
        private Label _alertBanner;

        private VisualElement _selectionPanel;
        private Label _selectionKind;
        private Label _selectionTitle;
        private Label _selectionLine1;
        private Label _selectionLine2;
        private Label _selectionLine3;
        private Button _repairButton;
        private Button _maintainButton;
        private Button _demolishButton;

        private Button _buildSolarButton;
        private Label _buildSolarTitle;
        private Label _buildSolarCost;
        private Label _buildSolarNote;

        private Button _saveButton;
        private Button _loadButton;
        private Label _saveStatus;

        private VisualElement _eventModal;
        private Label _eventTitle;
        private Label _eventBody;
        private Button _eventChoiceA;
        private Button _eventChoiceB;

        private readonly Button[] _speedButtons = new Button[4];

        private float _refreshTimer;

        /// <summary>
        /// Every element this controller binds to. A rename in Hud.uxml would otherwise fail silently,
        /// so the scene bootstrap checks this list against the layout.
        /// </summary>
        public static readonly string[] RequiredElementNames =
        {
            "cash-value", "income-value",
            "export-value", "installed-value",
            "clock-value", "sun-value",
            "speed-pause", "speed-1", "speed-2", "speed-3",
            "objective-title", "objective-value", "objective-fill", "objective-win",
            "alert-banner",
            "selection-panel", "selection-kind", "selection-title",
            "selection-line-1", "selection-line-2", "selection-line-3",
            "repair-button", "maintain-button", "demolish-button",
            "build-solar-button", "build-solar-title", "build-solar-cost", "build-solar-note",
            "save-button", "load-button", "save-status",
            "event-modal", "event-title", "event-body", "event-choice-a", "event-choice-b"
        };

        private void Awake()
        {
            _document = GetComponent<UIDocument>();
        }

        // Bound in Start so the UIDocument has already built its visual tree.
        private void Start()
        {
            _root = _document != null ? _document.rootVisualElement : null;
            if (_root == null)
            {
                Debug.LogError("[MegawattValley] HUD has no visual tree. Check the UIDocument source asset.");
                enabled = false;
                return;
            }

            _cashValue = _root.Q<Label>("cash-value");
            _incomeValue = _root.Q<Label>("income-value");
            _exportValue = _root.Q<Label>("export-value");
            _installedValue = _root.Q<Label>("installed-value");
            _clockValue = _root.Q<Label>("clock-value");
            _sunValue = _root.Q<Label>("sun-value");
            _objectiveTitle = _root.Q<Label>("objective-title");
            _objectiveValue = _root.Q<Label>("objective-value");
            _objectiveFill = _root.Q<VisualElement>("objective-fill");
            _objectiveWin = _root.Q<Label>("objective-win");
            _alertBanner = _root.Q<Label>("alert-banner");

            _selectionPanel = _root.Q<VisualElement>("selection-panel");
            _selectionKind = _root.Q<Label>("selection-kind");
            _selectionTitle = _root.Q<Label>("selection-title");
            _selectionLine1 = _root.Q<Label>("selection-line-1");
            _selectionLine2 = _root.Q<Label>("selection-line-2");
            _selectionLine3 = _root.Q<Label>("selection-line-3");
            _repairButton = _root.Q<Button>("repair-button");
            _maintainButton = _root.Q<Button>("maintain-button");
            _demolishButton = _root.Q<Button>("demolish-button");

            _buildSolarButton = _root.Q<Button>("build-solar-button");
            _buildSolarTitle = _root.Q<Label>("build-solar-title");
            _buildSolarCost = _root.Q<Label>("build-solar-cost");
            _buildSolarNote = _root.Q<Label>("build-solar-note");

            _saveButton = _root.Q<Button>("save-button");
            _loadButton = _root.Q<Button>("load-button");
            _saveStatus = _root.Q<Label>("save-status");

            _eventModal = _root.Q<VisualElement>("event-modal");
            _eventTitle = _root.Q<Label>("event-title");
            _eventBody = _root.Q<Label>("event-body");
            _eventChoiceA = _root.Q<Button>("event-choice-a");
            _eventChoiceB = _root.Q<Button>("event-choice-b");

            _speedButtons[0] = _root.Q<Button>("speed-pause");
            _speedButtons[1] = _root.Q<Button>("speed-1");
            _speedButtons[2] = _root.Q<Button>("speed-2");
            _speedButtons[3] = _root.Q<Button>("speed-3");

            for (int i = 0; i < _speedButtons.Length; i++)
            {
                int index = i;
                if (_speedButtons[i] != null)
                {
                    _speedButtons[i].clicked += () => SimulationClock.Instance?.SetSpeedIndex(index);
                }
            }

            if (_buildSolarButton != null)
            {
                _buildSolarButton.clicked += () => BuildModeController.Instance?.ToggleSolarPlacement();
            }

            if (_repairButton != null)
            {
                _repairButton.clicked += () => EquipmentCondition.Selected?.BeginRepair(assignTechnician: true);
            }

            if (_maintainButton != null)
            {
                _maintainButton.clicked += () => EquipmentCondition.Selected?.DoPreventiveMaintenance();
            }

            if (_demolishButton != null)
            {
                _demolishButton.clicked += () => BuildModeController.Instance?.DemolishSelected();
            }

            if (_saveButton != null)
            {
                _saveButton.clicked += () => SaveGameService.Instance?.Save();
            }

            if (_loadButton != null)
            {
                _loadButton.clicked += () => SaveGameService.Instance?.Load();
            }

            if (_eventChoiceA != null)
            {
                _eventChoiceA.clicked += () => HumorousEventController.Instance?.Choose(true);
            }

            if (_eventChoiceB != null)
            {
                _eventChoiceB.clicked += () => HumorousEventController.Instance?.Choose(false);
            }

            // Text that floats over the world should never eat a world click.
            foreach (var label in _root.Query<Label>().ToList())
            {
                if (label.ClassListContains("hint"))
                {
                    label.pickingMode = PickingMode.Ignore;
                }
            }

            Refresh();
        }

        private void OnDisable()
        {
            UiInputGuard.PointerOverUi = false;
        }

        private void Update()
        {
            if (_root == null)
            {
                return;
            }

            UpdatePointerGuard();
            RefreshEvent();

            _refreshTimer -= Time.unscaledDeltaTime;
            if (_refreshTimer > 0f)
            {
                return;
            }

            _refreshTimer = refreshInterval;
            Refresh();
        }

        /// <summary>
        /// World systems read the mouse directly, so they need to know when the cursor is over the HUD.
        /// </summary>
        private void UpdatePointerGuard()
        {
            var mouse = Mouse.current;
            if (mouse == null || _root?.panel == null)
            {
                UiInputGuard.PointerOverUi = false;
                return;
            }

            Vector2 panelPosition = RuntimePanelUtils.ScreenToPanel(_root.panel, mouse.position.ReadValue());
            UiInputGuard.PointerOverUi = _root.panel.Pick(panelPosition) != null;
        }

        private void Refresh()
        {
            RefreshCompany();
            RefreshPower();
            RefreshTime();
            RefreshObjective();
            RefreshBuildBar();
            RefreshSelection();
            RefreshAlert();
            RefreshSaveBar();
        }

        private void RefreshSaveBar()
        {
            var save = SaveGameService.Instance;
            if (save == null)
            {
                return;
            }

            SetText(_saveStatus, save.LastMessage);
            _loadButton?.SetEnabled(save.SaveExists);
        }

        private void RefreshCompany()
        {
            float cash = PlayerEconomy.Instance != null ? PlayerEconomy.Instance.Cash : 0f;
            float income = PowerBoard.TotalRevenuePerSecond;
            var scenario = ScenarioObjective.Instance != null ? ScenarioObjective.Instance.Scenario : null;
            float tariff = scenario != null ? scenario.ExportTariffPerMwPerSecond : 0f;

            SetText(_cashValue, $"${cash:N0}");
            if (income > 0f)
            {
                SetText(_incomeValue, $"+${income:0.0} / sec");
                SetStateClass(_incomeValue, "metric-good");
            }
            else if (tariff > 0f)
            {
                SetText(_incomeValue, $"tariff ${tariff:0}/MW·s");
                SetStateClass(_incomeValue, "metric-warn");
            }
            else
            {
                SetText(_incomeValue, "no income");
                SetStateClass(_incomeValue, "metric-warn");
            }
        }

        private void RefreshPower()
        {
            SetText(_exportValue, $"{PowerBoard.TotalMegawatts:0.000} MW");
            SetText(_installedValue, $"{PowerBoard.InstalledMegawatts:0.00} MW installed");
        }

        private void RefreshTime()
        {
            SetText(_clockValue, DayNightSun.ClockText);

            var clock = SimulationClock.Instance;
            string speed = clock != null ? (clock.IsPaused ? "paused" : $"{clock.CurrentSpeed:0}x") : "1x";
            SetText(_sunValue, $"Sun {DayNightSun.SolarFactor * 100f:0}%  ·  {speed}");

            int activeIndex = clock != null ? clock.SpeedIndex : 1;
            for (int i = 0; i < _speedButtons.Length; i++)
            {
                _speedButtons[i]?.EnableInClassList("speed-button-active", i == activeIndex);
            }
        }

        private void RefreshObjective()
        {
            var objective = ScenarioObjective.Instance;
            if (objective == null)
            {
                return;
            }

            float installed = PowerBoard.InstalledMegawatts;
            float target = Mathf.Max(0.0001f, objective.TargetInstalledMegawatts);
            float percent = Mathf.Clamp01(installed / target) * 100f;

            SetText(_objectiveTitle, objective.Description);
            SetText(_objectiveValue, $"{installed:0.00} / {target:0.00} MW installed");

            if (_objectiveFill != null)
            {
                _objectiveFill.style.width = new StyleLength(new Length(percent, LengthUnit.Percent));
            }

            Show(_objectiveWin, objective.IsComplete);
        }

        private void RefreshBuildBar()
        {
            var build = BuildModeController.Instance;
            if (build == null || _buildSolarButton == null)
            {
                return;
            }

            SetText(_buildSolarTitle, build.SolarDisplayName);
            SetText(_buildSolarCost, $"${build.SolarCost:N0}");
            SetText(_buildSolarNote, build.IsPlacing
                ? "placing — Esc to cancel"
                : $"{build.SolarNameplateMw:0.00} MW nameplate");

            _buildSolarButton.EnableInClassList("build-button-active", build.IsPlacing);
            _buildSolarButton.EnableInClassList("build-button-unaffordable", !build.CanAffordSolar && !build.IsPlacing);
        }

        private void RefreshSelection()
        {
            var equipment = EquipmentCondition.Selected;
            var staff = StaffIdentity.Selected;

            if (equipment != null)
            {
                ShowEquipment(equipment);
                return;
            }

            if (staff != null)
            {
                ShowStaff(staff);
                return;
            }

            Show(_selectionPanel, false);
        }

        private void ShowEquipment(EquipmentCondition equipment)
        {
            Show(_selectionPanel, true);
            SetText(_selectionKind, "SELECTED EQUIPMENT");
            SetText(_selectionTitle, equipment.name);

            string state = equipment.IsFaulted ? "FAULTED" : equipment.IsRepairing ? "under repair" : "online";
            SetText(_selectionLine1, $"Condition {equipment.Condition:0}%  ·  {state}");

            var solar = equipment.Solar;
            SetText(_selectionLine2, solar != null
                ? $"Output {solar.CurrentMegawatts:0.000} MW  ·  +${solar.RevenuePerSecond:0.0}/sec"
                : "No generator attached");

            bool offGrid = solar != null && !solar.IsConnectedToGrid;
            SetText(_selectionLine3, offGrid
                ? "Outside the grid ring — earns nothing here"
                : $"Repair ${equipment.EffectiveRepairCost:0} (F)  ·  Service ${equipment.PreventiveCost:0} (M)");
            SetStateClass(_selectionLine3, offGrid ? "metric-bad" : null);

            Show(_repairButton, true);
            Show(_maintainButton, true);
            Show(_demolishButton, true);
            var economy = PlayerEconomy.Instance;
            bool canPayRepair = economy == null || economy.CanAfford(equipment.EffectiveRepairCost);
            bool canPayService = economy == null || economy.CanAfford(equipment.PreventiveCost);

            _repairButton?.SetEnabled(equipment.IsFaulted && !equipment.IsRepairing && canPayRepair);
            _maintainButton?.SetEnabled(!equipment.IsFaulted && !equipment.IsRepairing && canPayService);

            if (_repairButton != null)
            {
                _repairButton.text = $"Repair ${equipment.EffectiveRepairCost:0}";
            }

            if (_maintainButton != null)
            {
                _maintainButton.text = $"Service ${equipment.PreventiveCost:0}";
            }
        }

        private void ShowStaff(StaffIdentity staff)
        {
            Show(_selectionPanel, true);
            SetText(_selectionKind, "SELECTED STAFF");
            SetText(_selectionTitle, $"{staff.StaffName} — {staff.Role}");
            SetText(_selectionLine1, staff.TraitDescription);

            var technician = staff.Technician;
            SetText(_selectionLine2, technician != null ? $"Status: {technician.Activity}" : "Status: on site");
            SetText(_selectionLine3, technician != null
                ? $"Walk {technician.MoveSpeed:0.0} m/s  ·  auto-repairs faults"
                : string.Empty);
            SetStateClass(_selectionLine3, null);

            Show(_repairButton, false);
            Show(_maintainButton, false);
            Show(_demolishButton, false);
        }

        private void RefreshAlert()
        {
            int disconnected = PowerBoard.DisconnectedCount;
            int faulted = MaintenanceBoard.FaultedCount;

            string message;
            if (faulted > 0)
            {
                var tech = TechnicianActor.Instance;
                bool techEnRoute = tech != null && tech.HasTask;
                if (techEnRoute)
                {
                    message = faulted == 1
                        ? "Array faulted — technician is on the way."
                        : $"{faulted} arrays faulted — technician is working through them.";
                }
                else
                {
                    message = faulted == 1
                        ? "Array faulted — waiting on cash or a free technician. (Dev: select array, press K to force faults.)"
                        : $"{faulted} arrays faulted — technician will clear them when cash allows.";
                }
            }
            else if (disconnected > 0)
            {
                message = disconnected == 1
                    ? "An array sits outside the grid ring and earns nothing."
                    : $"{disconnected} arrays sit outside the grid ring and earn nothing.";
            }
            else if (!DayNightSun.IsDaylight && PowerBoard.InstalledMegawatts > 0f)
            {
                message = "Night shift: no sun, so no export income.";
            }
            else
            {
                message = string.Empty;
            }

            SetText(_alertBanner, message);
            Show(_alertBanner, !string.IsNullOrEmpty(message));
        }

        private void RefreshEvent()
        {
            var pendingEvent = HumorousEventController.Instance;
            bool pending = pendingEvent != null && pendingEvent.IsPending;
            Show(_eventModal, pending);

            if (!pending)
            {
                return;
            }

            SetText(_eventTitle, pendingEvent.Title);
            SetText(_eventBody, pendingEvent.Body);

            if (_eventChoiceA != null)
            {
                _eventChoiceA.text = pendingEvent.ChoiceALabel;
                _eventChoiceA.SetEnabled(pendingEvent.CanAffordChoiceA);
            }

            if (_eventChoiceB != null)
            {
                _eventChoiceB.text = pendingEvent.ChoiceBLabel;
                _eventChoiceB.SetEnabled(pendingEvent.CanAffordChoiceB);
            }
        }

        private static void SetText(Label label, string text)
        {
            if (label != null && label.text != text)
            {
                label.text = text;
            }
        }

        private static void Show(VisualElement element, bool visible)
        {
            element?.EnableInClassList("hidden", !visible);
        }

        /// <summary>Applies one of the metric-good / metric-warn / metric-bad accents, clearing the others.</summary>
        private static void SetStateClass(VisualElement element, string stateClass)
        {
            if (element == null)
            {
                return;
            }

            element.EnableInClassList("metric-good", stateClass == "metric-good");
            element.EnableInClassList("metric-warn", stateClass == "metric-warn");
            element.EnableInClassList("metric-bad", stateClass == "metric-bad");
        }
    }
}
