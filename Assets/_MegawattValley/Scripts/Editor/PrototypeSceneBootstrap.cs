using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using MegawattValley.Cameras;
using MegawattValley.Core;

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

            // Ground
            var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(8f, 1f, 8f);
            var groundRenderer = ground.GetComponent<MeshRenderer>();
            if (groundRenderer != null)
            {
                groundRenderer.sharedMaterial = CreateLit(new Color(0.45f, 0.55f, 0.38f));
            }

            // Owned plot
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

            grid.AddComponent<GridExportNode>();

            // Scale reference blocks (S1-05)
            CreateScaleBlock("Scale_Human", new Vector3(-10f, 0.9f, -6f), new Vector3(0.5f, 1.8f, 0.5f), new Color(0.9f, 0.75f, 0.55f));
            CreateScaleBlock("Scale_Vehicle", new Vector3(-8f, 0.6f, -6f), new Vector3(2.2f, 1.2f, 1.2f), new Color(0.8f, 0.2f, 0.2f));
            CreateScaleBlock("Scale_Road", new Vector3(0f, 0.02f, -9f), new Vector3(20f, 0.05f, 2f), new Color(0.25f, 0.25f, 0.28f));
            CreateScaleBlock("Scale_SolarTable", new Vector3(-10f, 0.35f, -3f), new Vector3(4f, 0.4f, 2f), new Color(0.15f, 0.35f, 0.7f));
            CreateScaleBlock("Scale_Fence", new Vector3(-12f, 0.6f, 0f), new Vector3(0.15f, 1.2f, 4f), new Color(0.7f, 0.7f, 0.7f));
            CreateScaleBlock("Scale_Building", new Vector3(10f, 2f, -4f), new Vector3(4f, 4f, 4f), new Color(0.75f, 0.7f, 0.6f));

            // Sign / landmark
            var sign = GameObject.CreatePrimitive(PrimitiveType.Cube);
            sign.name = "MegawattValleySign";
            sign.transform.position = new Vector3(0f, 2.5f, 8f);
            sign.transform.localScale = new Vector3(8f, 3f, 0.4f);
            var signRenderer = sign.GetComponent<MeshRenderer>();
            if (signRenderer != null)
            {
                signRenderer.sharedMaterial = CreateLit(new Color(0.95f, 0.7f, 0.15f));
            }

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
            systems.AddComponent<PlayerEconomy>();
            systems.AddComponent<SimulationClock>();
            systems.AddComponent<BuildModeController>();
            systems.AddComponent<GroundClickMarker>();

            // Technician home near the building
            var tech = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            tech.name = "Technician";
            tech.transform.position = new Vector3(10f, 1f, -4f);
            tech.transform.localScale = new Vector3(0.5f, 0.9f, 0.5f);
            Object.DestroyImmediate(tech.GetComponent<Collider>());
            var techRenderer = tech.GetComponent<MeshRenderer>();
            if (techRenderer != null)
            {
                techRenderer.sharedMaterial = CreateLit(new Color(0.95f, 0.85f, 0.35f));
            }

            tech.AddComponent<TechnicianActor>();
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

            systems.AddComponent<HumorousEventController>();
            systems.AddComponent<ScenarioObjective>();

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
                var scenePathGuid = AssetDatabase.AssetPathToGUID(ScenePath);
                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };
            }

            AssetDatabase.SaveAssets();
            Debug.Log($"[MegawattValley] Prototype scene created at {ScenePath}");
        }

        private static void CreateScaleBlock(string name, Vector3 position, Vector3 scale, Color color)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            var meshRenderer = go.GetComponent<MeshRenderer>();
            if (meshRenderer != null)
            {
                meshRenderer.sharedMaterial = CreateLit(color);
            }
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
