using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UIElements;
using Unity.Cinemachine;

namespace MegawattValley.Core
{
    /// <summary>
    /// Compile-time smoke check that S0-03 core packages resolve.
    /// Safe to remove once real gameplay systems replace it.
    /// </summary>
    public static class CorePackagesSmokeCheck
    {
        public static string DescribeInstalledTooling()
        {
            // Input System
            _ = typeof(InputAction);

            // UI Toolkit (built-in modules.uielements)
            _ = typeof(VisualElement);

            // Cinemachine 3
            _ = typeof(CinemachineCamera);

            return "Input System + UI Toolkit + Cinemachine types resolve.";
        }

#if UNITY_EDITOR
        [UnityEditor.InitializeOnLoadMethod]
        private static void LogOnceInEditor()
        {
            Debug.Log($"[MegawattValley] {DescribeInstalledTooling()} ProBuilder is available in the Editor package set.");
        }
#endif
    }
}
