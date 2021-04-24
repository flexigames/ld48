using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class InputController : MonoBehaviour
{
    public Camera camera;

    public float sensitivity = 10.0f;
    void Update()
    {
        camera.transform.position = new Vector3(camera.transform.position.x, camera.transform.position.y + Input.mouseScrollDelta.y * sensitivity, camera.transform.position.z);
    }
}
