using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;

namespace MegawattValley.EditorTools
{
    /// <summary>
    /// Creates and configures the runtime UI Toolkit assets the HUD needs (S6-03).
    /// PanelSettings cannot be hand-authored safely, so it is generated here and committed.
    /// </summary>
    public static class UiAssetBootstrap
    {
        public const string UiFolder = "Assets/_MegawattValley/UI";
        public const string ThemePath = UiFolder + "/MegawattValleyTheme.tss";
        public const string PanelSettingsPath = UiFolder + "/HudPanelSettings.asset";
        public const string HudUxmlPath = UiFolder + "/Hud.uxml";

        [MenuItem("Megawatt Valley/Rebuild HUD Panel Settings")]
        public static PanelSettings EnsurePanelSettings()
        {
            var settings = AssetDatabase.LoadAssetAtPath<PanelSettings>(PanelSettingsPath);
            bool created = false;

            if (settings == null)
            {
                settings = ScriptableObject.CreateInstance<PanelSettings>();
                AssetDatabase.CreateAsset(settings, PanelSettingsPath);
                created = true;
            }

            var theme = AssetDatabase.LoadAssetAtPath<ThemeStyleSheet>(ThemePath);
            if (theme == null)
            {
                Debug.LogError($"[MegawattValley] Theme style sheet missing at {ThemePath}.");
            }

            settings.themeStyleSheet = theme;
            settings.scaleMode = PanelScaleMode.ScaleWithScreenSize;
            settings.referenceResolution = new Vector2Int(1920, 1080);
            settings.screenMatchMode = PanelScreenMatchMode.MatchWidthOrHeight;
            settings.match = 0.5f;
            settings.clearColor = false;
            settings.sortingOrder = 0f;

            EditorUtility.SetDirty(settings);
            AssetDatabase.SaveAssets();

            Debug.Log(created
                ? $"[MegawattValley] Created HUD panel settings at {PanelSettingsPath}."
                : $"[MegawattValley] Updated HUD panel settings at {PanelSettingsPath}.");

            return settings;
        }

        /// <summary>
        /// Fails loudly if Hud.uxml no longer contains every element HudController binds to.
        /// </summary>
        public static bool ValidateHudContract()
        {
            var tree = LoadHudTree();
            if (tree == null)
            {
                return false;
            }

            var instance = tree.Instantiate();
            var missing = new System.Collections.Generic.List<string>();
            foreach (var elementName in MegawattValley.UI.HudController.RequiredElementNames)
            {
                if (instance.Q(elementName) == null)
                {
                    missing.Add(elementName);
                }
            }

            if (missing.Count > 0)
            {
                Debug.LogError($"[MegawattValley] Hud.uxml is missing {missing.Count} element(s) the HUD binds to: {string.Join(", ", missing)}");
                return false;
            }

            Debug.Log($"[MegawattValley] HUD layout contract OK ({MegawattValley.UI.HudController.RequiredElementNames.Length} elements).");
            return true;
        }

        public static VisualTreeAsset LoadHudTree()
        {
            var tree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(HudUxmlPath);
            if (tree == null)
            {
                Debug.LogError($"[MegawattValley] HUD layout missing at {HudUxmlPath}.");
            }

            return tree;
        }
    }
}
