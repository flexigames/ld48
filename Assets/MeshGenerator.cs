using UnityEngine;
using System.Collections.Generic;

[RequireComponent(typeof (MeshFilter))]
[RequireComponent(typeof (MeshRenderer))]
[ExecuteInEditMode]
public class MeshGenerator : MonoBehaviour {

	void Awake () {
        Debug.Log("Start");
        var mesh = CreateCircleMesh();
        setMesh(mesh);
	}

	private void CreateCube () {
		Vector3[] vertices = {
			new Vector3 (0, 0, 0),
			new Vector3 (1, 0, 0),
			new Vector3 (1, 1, 0),
			new Vector3 (0, 1, 0),
			new Vector3 (0, 1, 1),
			new Vector3 (1, 1, 1),
			new Vector3 (1, 0, 1),
			new Vector3 (0, 0, 1),
		};

		int[] triangles = {
			0, 2, 1, //face front
			0, 3, 2,
			2, 3, 4, //face top
			2, 4, 5,
			1, 2, 5, //face right
			1, 5, 6,
			0, 7, 4, //face left
			0, 4, 3,
			5, 4, 7, //face back
			5, 7, 6,
			0, 6, 7, //face bottom
			0, 1, 6
		};
			
		Mesh mesh = GetComponent<MeshFilter>().mesh;
		mesh.Clear();
		mesh.vertices = vertices;
		mesh.triangles = triangles;
		mesh.Optimize ();
		mesh.RecalculateNormals();

        Debug.Log("Changed Mesh");
	}

    private void setMesh(Mesh newMesh) {
		Mesh mesh = GetComponent<MeshFilter>().sharedMesh;
		mesh.Clear();
		mesh.vertices = newMesh.vertices;
		mesh.triangles = newMesh.triangles;
		mesh.Optimize ();
		mesh.RecalculateNormals();

        Debug.Log("Changed Mesh");
    }

    private Mesh CreateCircleMesh()
    {
        const int CircleSegmentCount = 64;
        const int CircleVertexCount = CircleSegmentCount + 2;
        const int CircleIndexCount = CircleSegmentCount * 3;

        const int numberOfPieces = 4;


        var circle = new Mesh();
        var vertices = new List<Vector3>(CircleVertexCount);
        var indices = new int[CircleIndexCount];
        var segmentWidth = Mathf.PI * 2f / CircleSegmentCount;
        var angle = 0f;
        vertices.Add(Vector3.zero);

        // Removing here makes it a pie
        for (int i = 1; i < CircleVertexCount / numberOfPieces; ++i)
        {
            vertices.Add(new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)));
            angle -= segmentWidth;
            if (i > 1)
            {
                var j = (i - 2) * 3;
                indices[j + 0] = 0;
                indices[j + 1] = i - 1;
                indices[j + 2] = i;
            }
        }
        circle.SetVertices(vertices);
        circle.SetIndices(indices, MeshTopology.Triangles, 0);
        circle.RecalculateBounds();
        return circle;
    }
}