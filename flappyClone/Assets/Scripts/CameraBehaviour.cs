using UnityEngine;

public class CameraBehaviour : MonoBehaviour
{
    public GameObject bird;

    private float birdOffsetX;

    private void Start()
    {
        // Register bird offset for quick reference in the update loop.
        birdOffsetX = -bird.GetComponent<BirdBehaviour>().offsetX;
    }

    private void LateUpdate()
    {
        // Update the position based on bird position.
        var camPos = transform.position;
        transform.position = new Vector3(bird.transform.position.x + birdOffsetX, camPos.y, camPos.z);
    }
}