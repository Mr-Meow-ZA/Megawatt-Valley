using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UIElements;
using MegawattValley.Cameras;
using MegawattValley.Core;
using MegawattValley.Persistence;
using MegawattValley.UI;

namespace MegawattValley.EditorTools
{
    /// <summary>
    /// Batchmode-friendly bootstrap that creates the first playable prototype scene.
    /// </summary>
    public static class PrototypeSceneBootstrap
    {
        private const string ScenePath = "Assets/_MegawattValley/Scenes/Prototype_Valley.unity";

        public static void CreatePrototypeScene()
        {
            EnsureFolder("Assets/_MegawattValley/Scenes");

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            BuildValleyBlockout();

            // Grid export node (must be near to earn revenue)
            var grid = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            grid.name = "GridExportNode";
            grid.transform.position = new Vector3(8f, 0.75f, 0f);
            grid.transform.localScale = new Vector3(1.5f, 1.5f, 1.5f);
            Object.DestroyImmediate(grid.GetComponent<Collider>());
            var gridRenderer = grid.GetComponent<MeshRenderer>();
            if (gridRenderer != null)
            {
                gridRenderer.sharedMaterial = CreateLit(new Color(0.2f, 0.75f, 1f));
            }

            var gridNode = grid.AddComponent<GridExportNode>();
            // Radius is intentionally smaller than the green pad so the west side is outside
            // the sell circle — that is how players learn NO GRID without leaving the plot.
            AssignFloat(gridNode, "connectRadius", 14f);

            // Sun
            var sunGo = new GameObject("Sun");
            var sun = sunGo.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.1f;
            sun.shadows = LightShadows.Soft;
            sunGo.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
            sunGo.AddComponent<DayNightSun>();

            // Camera
            var cameraGo = new GameObject("TycoonCamera");
            var cam = cameraGo.AddComponent<UnityEngine.Camera>();
            cam.tag = "MainCamera";
            cam.clearFlags = CameraClearFlags.Skybox;
            cam.fieldOfView = 40f;
            cam.nearClipPlane = 0.3f;
            cam.farClipPlane = 300f;
            cameraGo.AddComponent<AudioListener>();
            cameraGo.AddComponent<TycoonCameraController>();

            // Systems
            var systems = new GameObject("GameSystems");
            var economy = systems.AddComponent<PlayerEconomy>();
            systems.AddComponent<SimulationClock>();
            var buildMode = systems.AddComponent<BuildModeController>();
            systems.AddComponent<GroundClickMarker>();

            // Technician waits by the office. Keeps its collider so the player can click it.
            var techHome = new GameObject("TechnicianHome");
            techHome.transform.position = new Vector3(12f, 0.9f, -8f);

            var tech = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            tech.name = "Technician";
            tech.transform.position = techHome.transform.position;
            tech.transform.localScale = new Vector3(0.5f, 0.9f, 0.5f);
            var techRenderer = tech.GetComponent<MeshRenderer>();
            if (techRenderer != null)
            {
                techRenderer.sharedMaterial = CreateLit(new Color(0.95f, 0.85f, 0.35f));
            }

            var technician = tech.AddComponent<TechnicianActor>();
            AssignReference(technician, "homePoint", techHome.transform);
            tech.AddComponent<StaffIdentity>();

            // Visual joke sign (S5-03) — reward for zooming in
            var joke = GameObject.CreatePrimitive(PrimitiveType.Cube);
            joke.name = "SafetySign_DoNotLickInverters";
            joke.transform.position = new Vector3(-6f, 1.2f, 7.2f);
            joke.transform.localScale = new Vector3(2.4f, 1.2f, 0.15f);
            Object.DestroyImmediate(joke.GetComponent<Collider>());
            var jokeRenderer = joke.GetComponent<MeshRenderer>();
            if (jokeRenderer != null)
            {
                jokeRenderer.sharedMaterial = CreateLit(new Color(1f, 0.92f, 0.2f));
            }

            var jokeLabelGo = new GameObject("JokeText");
            jokeLabelGo.transform.SetParent(joke.transform, false);
            jokeLabelGo.transform.localPosition = new Vector3(0f, 0f, -0.6f);
            jokeLabelGo.transform.localScale = new Vector3(0.1f, 0.1f, 0.1f);
            var jokeText = jokeLabelGo.AddComponent<TextMesh>();
            jokeText.text = "DO NOT LICK\nTHE INVERTERS";
            jokeText.fontSize = 40;
            jokeText.characterSize = 0.25f;
            jokeText.anchor = TextAnchor.MiddleCenter;
            jokeText.alignment = TextAlignment.Center;
            jokeText.color = Color.black;

            var events = systems.AddComponent<HumorousEventController>();
            var objective = systems.AddComponent<ScenarioObjective>();

            var saveService = systems.AddComponent<SaveGameService>();

            // Content pack (S6-04): balance values live in data, not in these components.
            var scenario = ContentBootstrap.EnsureScenario();
            var standardArray = ContentBootstrap.EnsureStandardArray();
            var bargainArray = ContentBootstrap.EnsureBargainArray();
            var eventDeck = ContentBootstrap.EnsureEventDeck();
            AssignReference(economy, "scenario", scenario);
            AssignReference(objective, "scenario", scenario);
            AssignReferenceArray(buildMode, "catalog", new Object[] { standardArray, bargainArray });
            AssignReferenceArray(events, "eventDeck", eventDeck);
            AssignReferenceArray(saveService, "knownArrays", new Object[] { standardArray, bargainArray });

            // HUD (S6-03). UIDocument is added before HudController so the tree exists first.
            var hud = new GameObject("HUD");
            var document = hud.AddComponent<UIDocument>();
            document.panelSettings = UiAssetBootstrap.EnsurePanelSettings();
            document.visualTreeAsset = UiAssetBootstrap.LoadHudTree();
            hud.AddComponent<HudController>();
            UiAssetBootstrap.ValidateHudContract();

            // Ambient
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.sun = sun;

            Directory.CreateDirectory(Path.GetDirectoryName(ScenePath)!.Replace('\\', '/'));
            bool saved = EditorSceneManager.SaveScene(scene, ScenePath);
            if (!saved)
            {
                throw new System.Exception($"Failed to save scene at {ScenePath}");
            }

            // Build settings: make prototype the startup scene.
            var sceneAsset = AssetDatabase.LoadAssetAtPath<SceneAsset>(ScenePath);
            if (sceneAsset != null)
            {
                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };
            }

            AssetDatabase.SaveAssets();
            Debug.Log($"[MegawattValley] Prototype scene created at {ScenePath}");
        }

        /// <summary>
        /// L1-01 grey-box valley: framed hills, access road, office compound, fenced plot.
        /// Scale references stay west of the buildable area so they never look like real gear.
        /// </summary>
        private static void BuildValleyBlockout()
        {
            // Valley floor
            var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(12f, 1f, 12f);
            var groundRenderer = ground.GetComponent<MeshRenderer>();
            if (groundRenderer != null)
            {
                groundRenderer.sharedMaterial = CreateLit(new Color(0.42f, 0.52f, 0.34f));
            }

            // Framing hills — read as a small valley, not an infinite pad
            CreateProp("Hill_North", new Vector3(0f, 2.5f, 28f), new Vector3(50f, 5f, 12f), new Color(0.32f, 0.42f, 0.28f), keepCollider: true);
            CreateProp("Hill_East", new Vector3(30f, 2f, 4f), new Vector3(10f, 4f, 36f), new Color(0.34f, 0.44f, 0.3f), keepCollider: true);
            CreateProp("Hill_West", new Vector3(-28f, 1.8f, 2f), new Vector3(8f, 3.5f, 30f), new Color(0.33f, 0.43f, 0.29f), keepCollider: true);
            CreateProp("Ridge_South", new Vector3(-4f, 1.2f, -26f), new Vector3(36f, 2.4f, 6f), new Color(0.36f, 0.45f, 0.31f), keepCollider: true);

            // Dry creek bed cutting past the site — cheap valley personality
            CreateProp("CreekBed", new Vector3(-10f, 0.04f, 2f), new Vector3(3f, 0.08f, 40f), new Color(0.55f, 0.5f, 0.38f), keepCollider: false);

            // Owned solar pad
            var plot = GameObject.CreatePrimitive(PrimitiveType.Cube);
            plot.name = "OwnedPlot";
            plot.transform.position = new Vector3(0f, 0.05f, 0f);
            plot.transform.localScale = new Vector3(24f, 0.1f, 16f);
            Object.DestroyImmediate(plot.GetComponent<Collider>());
            var plotCollider = plot.AddComponent<BoxCollider>();
            plotCollider.size = Vector3.one;
            var plotRenderer = plot.GetComponent<MeshRenderer>();
            if (plotRenderer != null)
            {
                plotRenderer.sharedMaterial = CreateLit(new Color(0.35f, 0.55f, 0.35f));
            }

            plot.AddComponent<SelectablePlot>();

            // Fence posts around the plot edge (readable boundary without sealing placement)
            CreateFenceRing();

            // Access road from the south ridge up to the site office
            CreateProp("AccessRoad", new Vector3(6f, 0.03f, -14f), new Vector3(4f, 0.06f, 20f), new Color(0.28f, 0.28f, 0.3f), keepCollider: false);
            CreateProp("SiteRoad", new Vector3(0f, 0.02f, -9f), new Vector3(22f, 0.05f, 2.2f), new Color(0.25f, 0.25f, 0.28f), keepCollider: false);

            // Office compound — the "you work here" presence for L1-01
            CreateProp("SiteOffice", new Vector3(12f, 2f, -4f), new Vector3(4f, 4f, 4f), new Color(0.78f, 0.72f, 0.6f), keepCollider: true);
            CreateProp("OfficeAnnex", new Vector3(15.5f, 1.2f, -4f), new Vector3(2.5f, 2.4f, 3f), new Color(0.7f, 0.65f, 0.55f), keepCollider: true);
            CreateProp("ParkingPad", new Vector3(12f, 0.04f, -8.5f), new Vector3(8f, 0.08f, 5f), new Color(0.3f, 0.3f, 0.32f), keepCollider: false);
            CreateProp("LaydownYard", new Vector3(18f, 0.04f, 2f), new Vector3(5f, 0.08f, 6f), new Color(0.4f, 0.38f, 0.32f), keepCollider: false);
            CreateProp("CrateStack", new Vector3(18f, 0.7f, 2f), new Vector3(1.6f, 1.4f, 1.6f), new Color(0.55f, 0.4f, 0.25f), keepCollider: true);

            // Site identity sign
            CreateProp("SiteNameSign", new Vector3(-2f, 1.6f, -11f), new Vector3(5f, 2.2f, 0.25f), new Color(0.2f, 0.45f, 0.55f), keepCollider: false);
            var siteLabelGo = new GameObject("SiteNameText");
            siteLabelGo.transform.position = new Vector3(-2f, 1.6f, -11.2f);
            siteLabelGo.transform.localScale = new Vector3(0.12f, 0.12f, 0.12f);
            var siteLabel = siteLabelGo.AddComponent<TextMesh>();
            siteLabel.text = "SUNNY SLOPE\nSite A — Easy Start";
            siteLabel.fontSize = 42;
            siteLabel.characterSize = 0.28f;
            siteLabel.anchor = TextAnchor.MiddleCenter;
            siteLabel.alignment = TextAlignment.Center;
            siteLabel.color = Color.white;

            // Landmark welcome sign on the north edge of the pad
            CreateProp("MegawattValleySign", new Vector3(0f, 2.5f, 8f), new Vector3(8f, 3f, 0.4f), new Color(0.95f, 0.7f, 0.15f), keepCollider: true);

            // Scale reference blocks (S1-05) — west of the buildable plot
            CreateProp("Scale_Human", new Vector3(-18f, 0.9f, -6f), new Vector3(0.5f, 1.8f, 0.5f), new Color(0.9f, 0.75f, 0.55f), keepCollider: true);
            CreateProp("Scale_Vehicle", new Vector3(-16f, 0.6f, -6f), new Vector3(2.2f, 1.2f, 1.2f), new Color(0.8f, 0.2f, 0.2f), keepCollider: true);
            CreateProp("Scale_SolarTable", new Vector3(-18f, 0.35f, -2f), new Vector3(4f, 0.4f, 2f), new Color(0.45f, 0.47f, 0.5f), keepCollider: true);
            CreateProp("Scale_Fence", new Vector3(-14f, 0.6f, 0f), new Vector3(0.15f, 1.2f, 4f), new Color(0.7f, 0.7f, 0.7f), keepCollider: true);
        }

        private static void CreateFenceRing()
        {
            // Plot is 24 x 16 centred on origin → edges at ±12 x, ±8 z.
            float halfX = 12f;
            float halfZ = 8f;
            var postColor = new Color(0.65f, 0.65f, 0.62f);
            Vector3[] corners =
            {
                new Vector3(-halfX, 0.7f, -halfZ),
                new Vector3(halfX, 0.7f, -halfZ),
                new Vector3(-halfX, 0.7f, halfZ),
                new Vector3(halfX, 0.7f, halfZ)
            };

            for (int i = 0; i < corners.Length; i++)
            {
                CreateProp($"FencePost_{i}", corners[i], new Vector3(0.25f, 1.4f, 0.25f), postColor, keepCollider: false);
            }

            CreateProp("Fence_South", new Vector3(0f, 0.55f, -halfZ), new Vector3(24f, 0.15f, 0.12f), postColor, keepCollider: false);
            CreateProp("Fence_North", new Vector3(0f, 0.55f, halfZ), new Vector3(24f, 0.15f, 0.12f), postColor, keepCollider: false);
            CreateProp("Fence_West", new Vector3(-halfX, 0.55f, 0f), new Vector3(0.12f, 0.15f, 16f), postColor, keepCollider: false);
            CreateProp("Fence_East", new Vector3(halfX, 0.55f, 0f), new Vector3(0.12f, 0.15f, 16f), postColor, keepCollider: false);
        }

        private static void CreateProp(string name, Vector3 position, Vector3 scale, Color color, bool keepCollider)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            if (!keepCollider)
            {
                Object.DestroyImmediate(go.GetComponent<Collider>());
            }

            var meshRenderer = go.GetComponent<MeshRenderer>();
            if (meshRenderer != null)
            {
                meshRenderer.sharedMaterial = CreateLit(color);
            }
        }

        /// <summary>
        /// Assigns a private [SerializeField] reference without widening the runtime API just for setup.
        /// </summary>
        private static void AssignReference(Component component, string fieldName, Object value)
        {
            var editable = new SerializedObject(component);
            var property = editable.FindProperty(fieldName);
            if (property == null)
            {
                Debug.LogError($"[MegawattValley] {component.GetType().Name} has no serialized field '{fieldName}'.");
                return;
            }

            property.objectReferenceValue = value;
            editable.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void AssignFloat(Component component, string fieldName, float value)
        {
            var editable = new SerializedObject(component);
            var property = editable.FindProperty(fieldName);
            if (property == null)
            {
                Debug.LogError($"[MegawattValley] {component.GetType().Name} has no serialized field '{fieldName}'.");
                return;
            }

            property.floatValue = value;
            editable.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void AssignReferenceArray(Component component, string fieldName, Object[] values)
        {
            var editable = new SerializedObject(component);
            var property = editable.FindProperty(fieldName);
            if (property == null || !property.isArray)
            {
                Debug.LogError($"[MegawattValley] {component.GetType().Name} has no serialized array '{fieldName}'.");
                return;
            }

            property.arraySize = values.Length;
            for (int i = 0; i < values.Length; i++)
            {
                property.GetArrayElementAtIndex(i).objectReferenceValue = values[i];
            }

            editable.ApplyModifiedPropertiesWithoutUndo();
        }

        private static Material CreateLit(Color color)
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            return new Material(shader) { color = color };
        }

        private static void EnsureFolder(string assetFolder)
        {
            if (AssetDatabase.IsValidFolder(assetFolder))
            {
                return;
            }

            string parent = Path.GetDirectoryName(assetFolder)?.Replace('\\', '/');
            string leaf = Path.GetFileName(assetFolder);
            if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
            {
                EnsureFolder(parent);
            }

            AssetDatabase.CreateFolder(parent, leaf);
        }
    }
}
