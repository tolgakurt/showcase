using UnityEngine;

public class UIBehaviour : MonoBehaviour
{
    public GameObject bird;
    public GameObject getReady;
    public GameObject tapToStart;
    public GameObject gameOver;
    public GameObject scoreBoard;
    public GameObject newHighScore;

    public AudioSource sfxPoint;

    public CounterBehaviour inGameCounter;
    public CounterBehaviour endGameCounter;
    public CounterBehaviour bestScoreCounter;

    private float birdOffsetX;

    private void Start()
    {
        // If there is no entry in the storage about the best point, create it.
        if (!PlayerPrefs.HasKey("BestPoint"))
        {
            PlayerPrefs.SetInt("BestPoint", 0);
        }

        // Register bird offset for quick reference in the update loop.
        birdOffsetX = -bird.GetComponent<BirdBehaviour>().offsetX;

        // Setup UI items for pre-game phase view.
        gameOver.SetActive(false);
        scoreBoard.SetActive(false);
        newHighScore.SetActive(false);
        getReady.SetActive(true);
        tapToStart.SetActive(true);
    }

    private GameState lastState;
    private int point = 0;

    private void LateUpdate()
    {
        // Update the position based on bird position.
        var uiPos = transform.position;
        transform.position = new Vector3(bird.transform.position.x + birdOffsetX, uiPos.y, uiPos.z);

        // Get the current game state and return if it's not changed.
        var gameState = bird.GetComponent<BirdBehaviour>().gameState;
        if (lastState == gameState) return;

        // Hide/show relevant UI items, and take other necessary actions.
        switch (gameState)
        {
            case GameState.PreGame:
                gameOver.SetActive(false);
                scoreBoard.SetActive(false);
                newHighScore.SetActive(false);
                getReady.SetActive(true);
                tapToStart.SetActive(true);

                // Reset points.
                point = 0;

                // Hide end-game and best score counters.
                endGameCounter.Hide();
                bestScoreCounter.Hide();
                break;

            case GameState.InGame:
                getReady.SetActive(false);
                tapToStart.SetActive(false);

                // Display initial points.
                inGameCounter.PrintPoints(point);
                break;

            case GameState.EndingGame:

                break;

            case GameState.GameOver:
                gameOver.SetActive(true);
                scoreBoard.SetActive(true);
                tapToStart.SetActive(true);

                // Hide in-game point counter.
                inGameCounter.Hide();

                // Update best point if necessary.
                var bestPoint = PlayerPrefs.GetInt("BestPoint");
                if (point > bestPoint)
                {
                    bestPoint = point;
                    newHighScore.SetActive(true);
                    PlayerPrefs.SetInt("BestPoint", bestPoint);
                }

                // Display end-game and best score counters.
                endGameCounter.PrintPoints(point);
                bestScoreCounter.PrintPoints(bestPoint);
                break;
        }

        // Update registered game state.
        lastState = gameState;
    }

    public void IncrementPoints()
    {
        sfxPoint.Play();
        point++;
        inGameCounter.PrintPoints(point);
    }
}