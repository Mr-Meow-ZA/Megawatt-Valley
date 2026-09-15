using UnityEngine;
using UnityEngine.InputSystem;

namespace MegawattValley.Cameras
{
    /// <summary>
    /// Tycoon-style orthographic-friendly orbit camera: pan, zoom, rotate around a pivot.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class TycoonCameraController : MonoBehaviour
    {
        [Header("Pivot")]
        [SerializeField] private Vector3 pivot = new Vector3(0f, 0f, 0f);
        [SerializeField] private float yaw = 45f;
        [SerializeField] private float pitch = 45f;

        [Header("Distance / Zoom")]
        [SerializeField] private float distance = 35f;
        [SerializeField] private float minDistance = 8f;
        [SerializeField] private float maxDistance = 80f;
        [SerializeField] private float zoomSpeed = 8f;
        [SerializeField] private float zoomSmoothing = 12f;

        [Header("Pan")]
        [SerializeField] private float panSpeed = 18f;
        [SerializeField] private float panSmoothing = 10f;
        [SerializeField] private float fastPanMultiplier = 2.25f;
        [SerializeField] private Vector2 panBounds = new Vector2(60f, 60f);

        [Header("Rotate")]
        [SerializeField] private float rotateSpeed = 120f;
        [SerializeField] private float minPitch = 20f;
        [SerializeField] private float maxPitch = 70f;
        [SerializeField] private float rotateSmoothing = 14f;

        private float _targetDistance;
        private float _targetYaw;
        private float _targetPitch;
        private Vector3 _targetPivot;

        private void Awake()
        {
            _targetDistance = distance;
            _targetYaw = yaw;
            _targetPitch = pitch;
            _targetPivot = pivot;
            ApplyTransform(1f);
        }

        private void Update()
        {
            HandleInput(Time.unscaledDeltaTime);
            ApplyTransform(Time.unscaledDeltaTime);
        }

        private void HandleInput(float dt)
        {
            var keyboard = Keyboard.current;
            var mouse = Mouse.current;
            if (keyboard == null || mouse == null)
            {
                return;
            }

            float speed = panSpeed * Mathf.Lerp(0.55f, 1.45f, Mathf.InverseLerp(minDistance, maxDistance, distance));
            if (keyboard.leftShiftKey.isPressed || keyboard.rightShiftKey.isPressed)
            {
                speed *= fastPanMultiplier;
            }

            Vector3 forward = Quaternion.Euler(0f, yaw, 0f) * Vector3.forward;
            Vector3 right = Quaternion.Euler(0f, yaw, 0f) * Vector3.right;
            Vector3 pan = Vector3.zero;

            if (keyboard.wKey.isPressed || keyboard.upArrowKey.isPressed) pan += forward;
            if (keyboard.sKey.isPressed || keyboard.downArrowKey.isPressed) pan -= forward;
            if (keyboard.dKey.isPressed || keyboard.rightArrowKey.isPressed) pan += right;
            if (keyboard.aKey.isPressed || keyboard.leftArrowKey.isPressed) pan -= right;

            // Middle-mouse drag pan
            if (mouse.middleButton.isPressed)
            {
                Vector2 delta = mouse.delta.ReadValue();
                pan += (-right * delta.x + -forward * delta.y) * (0.02f * speed);
            }

            if (pan.sqrMagnitude > 0.0001f)
            {
                _targetPivot += pan.normalized * (speed * dt);
            }

            _targetPivot.x = Mathf.Clamp(_targetPivot.x, -panBounds.x, panBounds.x);
            _targetPivot.z = Mathf.Clamp(_targetPivot.z, -panBounds.y, panBounds.y);
            _targetPivot.y = 0f;

            // Zoom: scroll wheel
            float scroll = mouse.scroll.ReadValue().y;
            if (Mathf.Abs(scroll) > 0.01f)
            {
                _targetDistance = Mathf.Clamp(_targetDistance - scroll * 0.04f * zoomSpeed, minDistance, maxDistance);
            }

            // Rotate: Q/E or right-mouse drag
            float rotate = 0f;
            if (keyboard.qKey.isPressed) rotate -= 1f;
            if (keyboard.eKey.isPressed) rotate += 1f;
            if (mouse.rightButton.isPressed)
            {
                Vector2 delta = mouse.delta.ReadValue();
                _targetYaw += delta.x * rotateSpeed * 0.02f;
                _targetPitch = Mathf.Clamp(_targetPitch - delta.y * rotateSpeed * 0.015f, minPitch, maxPitch);
            }

            _targetYaw += rotate * rotateSpeed * dt;
            _targetPitch = Mathf.Clamp(_targetPitch, minPitch, maxPitch);
        }

        private void ApplyTransform(float dt)
        {
            float zoomT = 1f - Mathf.Exp(-zoomSmoothing * dt);
            float panT = 1f - Mathf.Exp(-panSmoothing * dt);
            float rotT = 1f - Mathf.Exp(-rotateSmoothing * dt);

            distance = Mathf.Lerp(distance, _targetDistance, zoomT);
            pivot = Vector3.Lerp(pivot, _targetPivot, panT);
            yaw = Mathf.LerpAngle(yaw, _targetYaw, rotT);
            pitch = Mathf.Lerp(pitch, _targetPitch, rotT);

            Quaternion rotation = Quaternion.Euler(pitch, yaw, 0f);
            Vector3 offset = rotation * new Vector3(0f, 0f, -distance);
            transform.position = pivot + offset;
            transform.rotation = rotation;
        }

        public void FocusOn(Vector3 worldPoint)
        {
            _targetPivot = new Vector3(worldPoint.x, 0f, worldPoint.z);
        }
    }
}
