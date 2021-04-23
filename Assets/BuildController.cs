using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BuildController : MonoBehaviour
{
    public Camera camera;

    public GameObject buildPrefab;

    private Grid grid;

    public GameObject PlaceCursor;

    void Awake() {
        grid = FindObjectOfType<Grid>();
    }

    void Update()
    {
        int floorLayerMask = 1 << 3;

        RaycastHit hit;
        Ray ray = camera.ScreenPointToRay(Input.mousePosition);

        if (!Physics.Raycast(ray, out hit, Mathf.Infinity, floorLayerMask)) return;

        var placePoint = grid.GetNearestPointOnGrid(hit.point);

        PlaceCursor.transform.position = placePoint;

        if (!Input.GetMouseButtonDown(0)) return;

        Debug.Log(placePoint);

        Instantiate(buildPrefab, placePoint, Quaternion.identity);
    }
}
