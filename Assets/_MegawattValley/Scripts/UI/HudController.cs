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
        private Label _objectiveStars;
        private VisualElement _objectiveFill;
        private Label _objectiveWin;
        private Label _objectiveFail;
        private Button _restartButton;
        private Label _alertBanner;

        private VisualElement _selectionPanel;
        private Label _selectionKind;
        private Label _selectionTitle;
        private Label _selectionLine1;
        private Label _selectionLine2;
        private Label _selectionLine3;
        private Button _repairButton;
        private Button _maintainButton;
        private Button _cleanButton;
        private Button _demolishButton;

        private Label _capRadioLine;
        private Label _capCleanLine;
        private Label _beatTitle;
        private Label _beatBody;

        private Button _buildPremiumButton;
        private Label _buildPremiumTitle;
        private Label _buildPremiumCost;
        private Label _buildPremiumNote;
        private Button _buildBargainButton;
        private Label _buildBargainTitle;
        private Label _buildBargainCost;
        private Label _buildBargainNote;

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
            "objective-stars", "objective-title", "objective-value", "objective-fill", "objective-win",
            "objective-fail", "restart-button",
            "alert-banner",
            "selection-panel", "selection-kind", "selection-title",
            "selection-line-1", "selection-line-2", "selection-line-3",
            "repair-button", "maintain-button", "clean-button", "demolish-button",
            "cap-radio-line", "cap-clean-line", "beat-title", "beat-body",
            "build-premium-button", "build-premium-title", "build-premium-cost", "build-premium-note",
            "build-bargain-button", "build-bargain-title", "build-bargain-cost", "build-bargain-note",
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
            _objectiveStars = _root.Q<Label>("objective-stars");
            _objectiveFill = _root.Q<VisualElement>("objective-fill");
            _objectiveWin = _root.Q<Label>("objective-win");
            _objectiveFail = _root.Q<Label>("objective-fail");
            _restartButton = _root.Q<Button>("restart-button");
            _alertBanner = _root.Q<Label>("alert-banner");

            _selectionPanel = _root.Q<VisualElement>("selection-panel");
            _selectionKind = _root.Q<Label>("selection-kind");
            _selectionTitle = _root.Q<Label>("selection-title");
            _selectionLine1 = _root.Q<Label>("selection-line-1");
            _selectionLine2 = _root.Q<Label>("selection-line-2");
            _selectionLine3 = _root.Q<Label>("selection-line-3");
            _repairButton = _root.Q<Button>("repair-button");
            _maintainButton = _root.Q<Button>("maintain-button");
            _cleanButton = _root.Q<Button>("clean-button");
            _demolishButton = _root.Q<Button>("demolish-button");

            _capRadioLine = _root.Q<Label>("cap-radio-line");
            _capCleanLine = _root.Q<Label>("cap-clean-line");
            _beatTitle = _root.Q<Label>("beat-title");
            _beatBody = _root.Q<Label>("beat-body");

            _buildPremiumButton = _root.Q<Button>("build-premium-button");
            _buildPremiumTitle = _root.Q<Label>("build-premium-title");
            _buildPremiumCost = _root.Q<Label>("build-premium-cost");
            _buildPremiumNote = _root.Q<Label>("build-premium-note");
            _buildBargainButton = _root.Q<Button>("build-bargain-button");
            _buildBargainTitle = _root.Q<Label>("build-bargain-title");
            _buildBargainCost = _root.Q<Label>("build-bargain-cost");
            _buildBargainNote = _root.Q<Label>("build-bargain-note");

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

            if (_buildPremiumButton != null)
            {
                _buildPremiumButton.clicked += () => BuildModeController.Instance?.SelectCatalogEntry(0);
            }

            if (_buildBargainButton != null)
            {
                _buildBargainButton.clicked += () => BuildModeController.Instance?.SelectCatalogEntry(1);
            }

            if (_repairButton != null)
            {
                _repairButton.clicked += () => EquipmentCondition.Selected?.BeginRepair(assignTechnician: true);
            }

            if (_maintainButton != null)
            {
                _maintainButton.clicked += () => EquipmentCondition.Selected?.DoPreventiveMaintenance();
            }

            if (_cleanButton != null)
            {
                _cleanButton.clicked += () => EquipmentCondition.Selected?.BeginClean();
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

            if (_restartButton != null)
            {
                _restartButton.clicked += () => ScenarioObjective.Instance?.RestartScenario();
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
            RefreshCapabilities();
            RefreshBeat();
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
            SetText(_exportValue, $"{PowerBoard.TotalMegawatts:0.000} MW exporting");
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
            int day = DayNightSun.Instance != null ? DayNightSun.Instance.DayNumber : 1;
            float revenue = PlayerEconomy.Instance != null ? PlayerEconomy.Instance.LifetimeRevenue : 0f;
            float revenueTarget = Mathf.Max(0.0001f, objective.LifetimeRevenueForThreeStars);

            float percent;
            if (!objective.HasOneStar)
            {
                percent = Mathf.Clamp01(installed / target) * 100f;
                SetText(_objectiveValue, $"{installed:0.00} / {target:0.00} MW · day {day}/{objective.FailAfterDay}");
            }
            else if (!objective.HasTwoStar)
            {
                percent = Mathf.Clamp01(objective.RepairsCompleted / (float)objective.RepairsForTwoStars) * 100f;
                SetText(_objectiveValue, $"Repairs {objective.RepairsCompleted}/{objective.RepairsForTwoStars} · day {day}/{objective.FailAfterDay}");
            }
            else
            {
                percent = Mathf.Clamp01(revenue / revenueTarget) * 100f;
                SetText(_objectiveValue, $"Revenue ${revenue:0} / ${revenueTarget:0} · day {day}/{objective.FailAfterDay}");
            }

            SetText(_objectiveStars, objective.StarsLabel);
            SetText(_objectiveTitle, objective.NextGoalText);

            if (_objectiveFill != null)
            {
                _objectiveFill.style.width = new StyleLength(new Length(percent, LengthUnit.Percent));
            }

            if (_objectiveWin != null)
            {
                if (objective.HasThreeStar)
                {
                    _objectiveWin.text = "3★ CLEAR — Sunny Slope!";
                }
                else if (objective.HasTwoStar)
                {
                    _objectiveWin.text = "2★ — keep exporting for 3★";
                }
                else if (objective.HasOneStar)
                {
                    _objectiveWin.text = "1★ — Site B unlocked";
                }
            }

            Show(_objectiveWin, objective.HasOneStar && !objective.IsFailed);
            Show(_objectiveFail, objective.IsFailed);
            Show(_restartButton, objective.IsTerminal || objective.HasOneStar);
        }

        private void RefreshCapabilities()
        {
            var caps = CompanyCapabilities.Instance;
            bool radio = caps != null && caps.IsUnlocked(MegawattValley.Data.CapabilityIds.RadioDispatch);
            bool kit = caps != null && caps.IsUnlocked(MegawattValley.Data.CapabilityIds.BasicCleaningKit);

            SetText(_capRadioLine, radio ? "Radio Dispatch — UNLOCKED" : "Radio Dispatch — LOCKED");
            SetText(_capCleanLine, kit ? "Cleaning Kit — UNLOCKED" : "Cleaning Kit — LOCKED");
            _capRadioLine?.EnableInClassList("cap-unlocked", radio);
            _capRadioLine?.EnableInClassList("cap-locked", !radio);
            _capCleanLine?.EnableInClassList("cap-unlocked", kit);
            _capCleanLine?.EnableInClassList("cap-locked", !kit);
        }

        private void RefreshBeat()
        {
            var ladder = ObjectiveLadder.Instance;
            if (ladder == null)
            {
                return;
            }

            SetText(_beatTitle, ladder.CurrentBeatTitle);
            SetText(_beatBody, ladder.CurrentBeatBody);
        }

        private void RefreshBuildBar()
        {
            var build = BuildModeController.Instance;
            if (build == null)
            {
                return;
            }

            RefreshCatalogButton(0, _buildPremiumButton, _buildPremiumTitle, _buildPremiumCost, _buildPremiumNote, build);
            RefreshCatalogButton(1, _buildBargainButton, _buildBargainTitle, _buildBargainCost, _buildBargainNote, build);
        }

        private static void RefreshCatalogButton(
            int index,
            Button button,
            Label title,
            Label cost,
            Label note,
            BuildModeController build)
        {
            if (button == null)
            {
                return;
            }

            var definition = build.GetCatalogEntry(index);
            if (definition == null)
            {
                Show(button, false);
                return;
            }

            Show(button, true);
            SetText(title, definition.DisplayName);
            SetText(cost, $"${definition.BuildCost:N0}");
            bool placing = build.IsCatalogEntrySelected(index);
            SetText(note, placing
                ? "placing — Esc cancel"
                : $"{definition.NameplateMegawatts:0.00} MW · wear {definition.WearPerSecond:0.00}/s");

            button.EnableInClassList("build-button-active", placing);
            button.EnableInClassList("build-button-unaffordable", !build.CanAffordCatalogEntry(index) && !placing);
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

            string state = equipment.IsFaulted ? "FAULTED" : equipment.IsRepairing ? "under repair" :
                equipment.IsCleaning ? "cleaning" : "online";
            SetText(_selectionLine1, $"Condition {equipment.Condition:0}%  ·  Dust {equipment.Soiling:0}%  ·  {state}");

            var solar = equipment.Solar;
            SetText(_selectionLine2, solar != null
                ? $"Output {solar.CurrentMegawatts:0.000} MW  ·  +${solar.RevenuePerSecond:0.0}/sec"
                : "No generator attached");

            bool offGrid = solar != null && !solar.IsConnectedToGrid;
            SetText(_selectionLine3, offGrid
                ? "Outside the grid ring — earns nothing here"
                : $"Repair ${equipment.EffectiveRepairCost:0} (F)  ·  Service ${equipment.PreventiveCost:0} (M)  ·  Clean $15 (C)");
            SetStateClass(_selectionLine3, offGrid ? "metric-bad" : null);

            Show(_repairButton, true);
            Show(_maintainButton, true);
            Show(_cleanButton, true);
            Show(_demolishButton, true);
            var economy = PlayerEconomy.Instance;
            bool canPayRepair = economy == null || economy.CanAfford(equipment.EffectiveRepairCost);
            bool canPayService = economy == null || economy.CanAfford(equipment.PreventiveCost);
            bool canPayClean = economy == null || economy.CanAfford(15f);

            _repairButton?.SetEnabled(equipment.IsFaulted && !equipment.IsRepairing && canPayRepair);
            _maintainButton?.SetEnabled(!equipment.IsFaulted && !equipment.IsRepairing && !equipment.IsCleaning && canPayService);
            _cleanButton?.SetEnabled(!equipment.IsFaulted && !equipment.IsRepairing && !equipment.IsCleaning &&
                                     equipment.Soiling >= 5f && canPayClean);

            if (_repairButton != null)
            {
                _repairButton.text = $"Repair ${equipment.EffectiveRepairCost:0}";
            }

            if (_maintainButton != null)
            {
                _maintainButton.text = $"Service ${equipment.PreventiveCost:0}";
            }

            if (_cleanButton != null)
            {
                _cleanButton.text = $"Clean ${15:0} ({equipment.EffectiveCleanSeconds:0.0}s)";
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
                ? (CompanyCapabilities.Instance != null &&
                   CompanyCapabilities.Instance.IsUnlocked(MegawattValley.Data.CapabilityIds.RadioDispatch)
                    ? $"Walk {technician.MoveSpeed:0.0} m/s  ·  Radio Dispatch ON"
                    : $"Walk {technician.MoveSpeed:0.0} m/s  ·  Radio Dispatch LOCKED — use F")
                : string.Empty);
            SetStateClass(_selectionLine3, null);

            Show(_repairButton, false);
            Show(_maintainButton, false);
            Show(_cleanButton, false);
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
                    bool radio = CompanyCapabilities.Instance != null &&
                                 CompanyCapabilities.Instance.IsUnlocked(MegawattValley.Data.CapabilityIds.RadioDispatch);
                    message = radio
                        ? (faulted == 1
                            ? "Array faulted — technician will clear when cash allows."
                            : $"{faulted} arrays faulted — technician will clear them when cash allows.")
                        : (faulted == 1
                            ? "Array faulted — Radio Dispatch locked. Select it and press F to send Jordan."
                            : $"{faulted} arrays faulted — Radio Dispatch locked. Select one and press F.");
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
