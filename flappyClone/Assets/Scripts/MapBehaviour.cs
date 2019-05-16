using UnityEngine;

public class MapBehaviour : MonoBehaviour
{
    public GameObject bird;

    public MeshRenderer city;

    public Material bgDay;
    public Material bgNight;

    public Transform ground1;
    public Transform ground2;
    public Transform pipePair1;
    public Transform pipePair2;
    public Transform pipePair3;
    public Transform pipePair4;

    private float birdOffsetX;
    private float constHorVel;

    private readonly float initFirstPipePairPosX = 3.0f;
    private readonly float initFirstPipePairPosY = 0.0f;
    private readonly float initFirstPipePairPosZ = 0.0f;
    private readonly float interPipePairDistance = 1.52f;

    private void Start()
    {
        // Register bird offset for quick reference in the update loop.
        birdOffsetX = -bird.GetComponent<BirdBehaviour>().offsetX;

        // Register constant horizontal velocity on the bird for quick reference in the update loop.
        constHorVel = bird.GetComponent<BirdBehaviour>().constHorVel;

        // Reset pipe positions and randomize their elevations.
        ResetPipePositions();

        // Let BirdBehaviour know the upper level of the ground.
        bird.GetComponent<BirdBehaviour>().GroundUpperY = ground1.localPosition.y + ground1.localScale.y * 0.5f;
    }

    private GameState lastState;

    private void LateUpdate()
    {
        // Update the position based on bird position.
        var mapPos = transform.position;
        transform.position = new Vector3(bird.transform.position.x + birdOffsetX, mapPos.y, mapPos.z);

        // Get the current game state and flag if it's changed.
        var gameState = bird.GetComponent<BirdBehaviour>().gameState;
        var stateChanged = lastState != gameState;

        // Take actions based on game state.
        switch (gameState)
        {
            case GameState.PreGame:
                if (stateChanged)
                {
                    // Reset pipe positions and randomize their elevations.
                    ResetPipePositions();

                    // Randomly select a city scape: day or night.
                    RandomizeCity();
                }
                UpdateGroundPositions();
                break;

            case GameState.InGame:
                UpdateGroundPositions();
                UpdatePipePositions();
                break;

            case GameState.EndingGame:
                break;

            case GameState.GameOver:
                break;
        }

        // Update registered game state.
        lastState = gameState;
    }

    private float GetRandomPipeElevation()
    {
        return Random.Range(-0.4f, 1.25f);
    }

    private void ResetPipePositions()
    {
        pipePair1.localPosition = new Vector3(
            initFirstPipePairPosX,
            initFirstPipePairPosY + GetRandomPipeElevation(),
            initFirstPipePairPosZ
        );
        pipePair2.localPosition = new Vector3(
            initFirstPipePairPosX + interPipePairDistance,
            initFirstPipePairPosY + GetRandomPipeElevation(),
            initFirstPipePairPosZ
        );
        pipePair3.localPosition = new Vector3(
            initFirstPipePairPosX + interPipePairDistance * 2.0f,
            initFirstPipePairPosY + GetRandomPipeElevation(),
            initFirstPipePairPosZ
        );
        pipePair4.localPosition = new Vector3(
            initFirstPipePairPosX + interPipePairDistance * 3.0f,
            initFirstPipePairPosY + GetRandomPipeElevation(),
            initFirstPipePairPosZ
        );
    }

    private void RandomizeCity()
    {
        var materials = city.materials;
        materials[0] = Random.Range(0, 2) == 0 ? bgDay : bgNight;
        city.materials = materials;
    }

    private void UpdateGroundPositions()
    {
        // Move both grounds left based on the constant horizontal force.
        var dx = constHorVel * Time.deltaTime;
        ground1.localPosition -= new Vector3(dx, 0.0f, 0.0f);
        ground2.localPosition -= new Vector3(dx, 0.0f, 0.0f);

        // If one of the grounds went left too much, put it right of the other ground.
        // The way to understand this is to check if both grounds have an x position
        // less than 0.
        if (ground1.localPosition.x < 0.0f && ground2.localPosition.x < 0.0f)
        {
            // The first ground is leftwards, move it just right of the second ground.
            if (ground1.localPosition.x < ground2.localPosition.x)
            {
                ground1.localPosition = ground2.localPosition + new Vector3(ground1.localScale.x, 0.0f, 0.0f);
            }

            // The second ground is leftwards, move it just right of the first ground.
            else
            {
                ground2.localPosition = ground1.localPosition + new Vector3(ground2.localScale.x, 0.0f, 0.0f);
            }
        }
    }

    private void UpdatePipePositions()
    {
        // Move all pipe pairs left based on the constant horizontal force.
        var dx = constHorVel * Time.deltaTime;
        pipePair1.localPosition -= new Vector3(dx, 0.0f, 0.0f);
        pipePair2.localPosition -= new Vector3(dx, 0.0f, 0.0f);
        pipePair3.localPosition -= new Vector3(dx, 0.0f, 0.0f);
        pipePair4.localPosition -= new Vector3(dx, 0.0f, 0.0f);

        // Check if any of the pipe pairs went too much left. In that case, move it right
        // by a constant amount with a random elevation.
        if (pipePair1.localPosition.x < -2.25f)
        {
            pipePair1.localPosition = new Vector3(
                pipePair1.localPosition.x + interPipePairDistance * 4.0f,
                initFirstPipePairPosY + GetRandomPipeElevation(),
                pipePair1.localPosition.z
            );
        }
        else if (pipePair2.localPosition.x < -2.25f)
        {
            pipePair2.localPosition = new Vector3(
                pipePair2.localPosition.x + interPipePairDistance * 4.0f,
                initFirstPipePairPosY + GetRandomPipeElevation(),
                pipePair2.localPosition.z
            );
        }
        else if (pipePair3.localPosition.x < -2.25f)
        {
            pipePair3.localPosition = new Vector3(
                pipePair3.localPosition.x + interPipePairDistance * 4.0f,
                initFirstPipePairPosY + GetRandomPipeElevation(),
                pipePair3.localPosition.z
            );
        }
        else if (pipePair4.localPosition.x < -2.25f)
        {
            pipePair4.localPosition = new Vector3(
                pipePair4.localPosition.x + interPipePairDistance * 4.0f,
                initFirstPipePairPosY + GetRandomPipeElevation(),
                pipePair4.localPosition.z
            );
        }
    }
}