using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteInEditMode]
public class FloorGenerator : MonoBehaviour
{    
    public GameObject segmentPrefab;
    public int segmentCount = 6;

    void Awake()
    {
        ClearChildren();

        var segmentAngle = 360.0f / segmentCount;

        for (var i = 0; i < segmentCount; i++) {
          Instantiate(segmentPrefab, gameObject.transform.position, Quaternion.Euler(0, i * segmentAngle, 0), gameObject.transform);
        }


        Debug.Log("Run");
    }

    public void ClearChildren()
    {
        Debug.Log(transform.childCount);
        int i = 0;

        //Array to hold all child obj
        GameObject[] allChildren = new GameObject[transform.childCount];

        //Find all child obj and store to that array
        foreach (Transform child in transform)
        {
            allChildren[i] = child.gameObject;
            i += 1;
        }

        //Now destroy them
        foreach (GameObject child in allChildren)
        {
            DestroyImmediate(child.gameObject);
        }

        Debug.Log(transform.childCount);
    }
}
