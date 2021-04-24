using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FloorController : MonoBehaviour
{
    public int numberOfFloors = 10;
    public GameObject floorPrefab;

    public int height = 8;

    public Camera screenCamera;

    public GameObject buildPreview;

    void Start()
    {
        for (var i = 0; i < numberOfFloors; i++) {
            Instantiate(floorPrefab, new Vector3(0,i * height,0), Quaternion.identity);
        }
    }

    
    void Update() 
    {
        RaycastHit hit;
        Ray ray = screenCamera.ScreenPointToRay(Input.mousePosition);

        if (!Physics.Raycast(ray, out hit, Mathf.Infinity)) return;

        buildPreview.transform.position = hit.collider.gameObject.transform.position;
        buildPreview.transform.rotation = hit.collider.gameObject.transform.rotation;
        buildPreview.transform.localScale = hit.collider.gameObject.transform.localScale;

        Debug.Log("hit");
    }

}
