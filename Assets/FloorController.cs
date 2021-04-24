using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FloorController : MonoBehaviour
{
    public int numberOfFloors = 10;
    public GameObject floorPrefab;

    public float height = 8.5f;

    public Camera screenCamera;

    public GameObject buildPreview;

    private GameObject currentlySelected;

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

        if (currentlySelected != hit.collider.gameObject) {
            if (currentlySelected) {
                currentlySelected.GetComponentInChildren<Renderer>().enabled = true;
            }
            hit.collider.gameObject.GetComponentInChildren<Renderer>().enabled = false;
            currentlySelected = hit.collider.gameObject;
        }

        if (!Input.GetMouseButtonDown(0)) return;

        currentlySelected = null;

        Instantiate(buildPreview, hit.collider.gameObject.transform.position, hit.collider.gameObject.transform.rotation);
        Destroy(hit.collider.gameObject);

    }

}
