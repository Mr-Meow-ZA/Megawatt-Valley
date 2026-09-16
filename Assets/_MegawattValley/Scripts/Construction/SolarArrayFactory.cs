using MegawattValley.Core;
using MegawattValley.Data;
using UnityEngine;

namespace MegawattValley.Construction
{
    /// <summary>
    /// Builds the grey-box GameObject for a solar array from its definition, so build mode and
    /// events cannot drift apart in how an array is assembled (S6-04).
    /// </summary>
    public static class SolarArrayFactory
    {
        public static GameObject CreateGhost(SolarArrayDefinition definition, Material ghostMaterial)
        {
            var root = CreateShell("SolarArrayGhost", definition, ghostMaterial, addCollider: false);
            return root;
        }

        public static GameObject CreateArray(SolarArrayDefinition definition, Vector3 position, float yaw)
        {
            var root = CreateShell(definition != null ? definition.DisplayName : "SolarArray", definition, null, addCollider: true);
            root.transform.position = position;
            root.transform.rotation = Quaternion.Euler(0f, yaw, 0f);

            var unit = root.AddComponent<SolarArrayUnit>();
            unit.Configure(definition);

            var condition = root.AddComponent<EquipmentCondition>();
            condition.Configure(definition);

            return root;
        }

        private static GameObject CreateShell(string objectName, SolarArrayDefinition definition, Material overrideMaterial, bool addCollider)
        {
            Vector3 footprint = definition != null ? definition.Footprint : new Vector3(4f, 0.4f, 2f);
            Color color = definition != null ? definition.BodyColor : new Color(0.15f, 0.35f, 0.7f);

            var root = new GameObject(objectName);

            var body = GameObject.CreatePrimitive(PrimitiveType.Cube);
            body.name = "PanelTable";
            body.transform.SetParent(root.transform, false);
            body.transform.localScale = footprint;
            body.transform.localPosition = new Vector3(0f, footprint.y * 0.5f, 0f);
            Object.Destroy(body.GetComponent<Collider>());

            var meshRenderer = body.GetComponent<MeshRenderer>();
            if (meshRenderer != null)
            {
                meshRenderer.sharedMaterial = overrideMaterial != null
                    ? overrideMaterial
                    : GroundClickMarker.CreateColorMaterial(color);
            }

            if (addCollider)
            {
                var collider = root.AddComponent<BoxCollider>();
                collider.center = new Vector3(0f, footprint.y * 0.5f, 0f);
                collider.size = footprint;
            }

            return root;
        }
    }
}
