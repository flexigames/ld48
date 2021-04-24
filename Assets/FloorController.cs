using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FloorController : MonoBehaviour
{
    public int numberOfFloors = 10;
    public GameObject floorPrefab;

    public int height = 8;

    void Start()
    {
        for (var i = 0; i < numberOfFloors; i++) {
            Instantiate(floorPrefab, new Vector3(0,i * height,0), Quaternion.identity);
        }
    }

}
