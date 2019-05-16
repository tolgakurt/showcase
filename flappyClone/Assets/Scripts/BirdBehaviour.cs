using System.Collections;
using UnityEngine;

public class BirdBehaviour : MonoBehaviour
{
    public UIBehaviour uiBehaviour;

    public float offsetX = -0.57f;

    public GameState gameState;

    public AudioSource sfxWing;
    public AudioSource sfxHit;
    public AudioSource sfxSwoosh;
    public AudioSource sfxDie;

    public readonly float constHorVel = 0.9f;

    // This class doesn't know MapBehaviour, but MapBehaviour knows the bird.
    // We need to know the upper level of the ground, so that we can correct
    // the position of the bird when it's dead, lying on the floor.
    // MapBehaviour should set this during its Start function.
    public float GroundUpperY { get; set; }

    private BirdState birdState;

    private bool canJump = true;

    private readonly float floatPeriod = 1.5f; // in seconds.
    private readonly float floatAmplitude = 0.07f;
    private readonly float gravAcc = -9.8f;
    private readonly float jumpVel = 2.46f;
    private readonly float jumpTimeout = 0.08f; // in seconds.
    private readonly float jumpAngle = 22.0f; // in degrees.
    private readonly float jumpingVelLimit = -0.5f;
    private readonly float fallingVelLimit = -5.6f;

    private float currVerVel = 0.0f;
    private float lastJumpTime = 0.0f;
    private float dyingRz;
    private float dyingRotVel = -400.0f;

    private Vector3 initPos;

    private void Start()
    {
        // Aim 60fps.
        Application.targetFrameRate = 60;

        // Apply x offset to the position and register the initial position.
        var birdPos = transform.position;
        transform.position = new Vector3(birdPos.x + offsetX, birdPos.y, birdPos.z);
        initPos = transform.position;

        // Game can start.
        UpdateGameState(GameState.PreGame);
    }

    private void Update()
    {
        DetectUserInput();
        UpdatePosition();
        UpdateRotation();
    }

    private void UpdateGameState(GameState newState)
    {
        // Update game state.
        gameState = newState;

        // In the pre-game phase, bird should be floating, with a rather slow wing movement.
        if (gameState == GameState.PreGame)
        {
            birdState = BirdState.Floating;
            gameObject.GetComponent<Animator>().speed = 1.0f;

            // Reset bird position to its initial position and zero rotation.
            transform.position = initPos;
            transform.rotation = Quaternion.Euler(0.0f, 0.0f, 0.0f);

            // Play a sound to indicate we are in pre-game phase.
            sfxSwoosh.Play();

            // Randomly select a bird: blue, yellow, or red. We do this in a
            // coroutine, because changing bird animation is an event trigger
            // process, which requires a delay in the thread. We don't (and can't)
            // have a delay in the main thread, so we create a new.
            StartCoroutine(RandomizeBird());
        }

        // The bird should be flying in the game, with a rather faster wing movement.
        else if (gameState == GameState.InGame)
        {
            birdState = BirdState.Flying;
            gameObject.GetComponent<Animator>().speed = 2.0f;
        }

        // If the game is ending, the bird should be dying, with a slow wing movement.
        else if (gameState == GameState.EndingGame)
        {
            birdState = BirdState.Dying;
            gameObject.GetComponent<Animator>().speed = 1.25f;

            // If the bird has a positive vertical velocity due to a jump, we should
            // make it zero, so that it won't go up while dying.
            currVerVel = 0.0f;

            // Current z rotation of the bird should be the initial dying z rotation
            // which will be updated until the bird is completely dead lying on ground.
            // However, transform.eulerAngles.z is not enough, since it is in between
            // 0 and 360, but we want it to be between -90 and 0 if the bird is looking
            // downwards.
            dyingRz = transform.eulerAngles.z < 270.0 ? transform.eulerAngles.z : transform.eulerAngles.z - 360.0f;
        }

        // If the game is over, the bird should be dead, with no wing movement.
        else if (gameState == GameState.GameOver)
        {
            birdState = BirdState.Dead;
            gameObject.GetComponent<Animator>().speed = 0.0f;

            // When the game is over, the bird should be looking ground.
            transform.rotation = Quaternion.Euler(0.0f, 0.0f, -90.0f);

            // The bird should be lying just above the ground when it's dead. However,
            // the collision detection might have occured a bit after the bird actually
            // hit ground. We should correct that by setting the y position of the bird
            // equal to ground upper level, plus half the horizontal width of the bird.
            // Why horizontal? Because when the bird is dead, it is looking ground, which
            // means its vertical height is equal to the horizontal width of it while floating.
            // As the last step, we multiply the width with 0.8, so that bird's mouth is a
            // bit into the ground.
            var sprite = gameObject.GetComponent<SpriteRenderer>().sprite;
            var width = sprite.rect.width / sprite.pixelsPerUnit * 0.8f;
            transform.position = new Vector3(transform.position.x, GroundUpperY + width * 0.5f, transform.position.z);
        }
    }


    private IEnumerator RandomizeBird()
    {
        // Access the animator and set `ToBase` trigger, so that the animation is set to
        // default blank animation, and then we can other animations. See `Bird` animator
        // in `Assets/Animations` for trigger connections.
        var animator = gameObject.GetComponent<Animator>();
        animator.SetTrigger("ToBase");

        // After setting `ToBase` trigger, we need to wait for a small amount of time
        // to ensure that the animation is triggered. After that, we reset `ToBase`
        // trigger, so that we can trigger one of the actual animations below.
        yield return new WaitForSeconds(0.01f);
        animator.ResetTrigger("ToBase");

        // Based on a random number, trigger one of the animations.
        switch (Random.Range(0, 3))
        {
            case 0:
                animator.SetTrigger("MakeBlue");
                break;

            case 1:
                animator.SetTrigger("MakeRed");
                break;

            case 2:
                animator.SetTrigger("MakeYellow");
                break;
        }
        yield return new WaitForSeconds(0.01f);
    }

    private void DetectUserInput()
    {
        // If the user doesn't click the primary mouse button, return.
        if (Input.GetMouseButtonDown(0) == false) return;

        // From this point on, we know that user clicked primary mouse button.

        // If the game hasn't started yet, mouse click will start it.
        if (gameState == GameState.PreGame)
        {
            UpdateGameState(GameState.InGame);

            // When the game is started, the bird should jump.
            sfxWing.Play();
            currVerVel = jumpVel;
            lastJumpTime = Time.time;
        }

        // If we are in the game, can jump, and a certain amount of time passed since the last jump, jump again.
        else if (gameState == GameState.InGame && canJump && Time.time - lastJumpTime >= jumpTimeout)
        {
            sfxWing.Play();
            currVerVel = jumpVel;
            lastJumpTime = Time.time;
        }

        // If the game is over, a click will reset it to the pre-game state.
        else if (gameState == GameState.GameOver)
        {
            UpdateGameState(GameState.PreGame);
        }
    }

    private void UpdatePosition()
    {
        // If the bird is floating, it should be periodically going up and down
        // in y direction, with no horizontal movement.
        if (birdState == BirdState.Floating)
        {
            // The position of the bird while floating is sinusoidal. It will go from initial y to `+floatAmplitude`,
            // and then to `-floatAmplitude`, and back to initial y in `floatPeriod` seconds.
            // The formula of the periodical movement is (current time modulus `floatPeriod`) / `floatPeriod`;
            // which will give us a normalized number in between 0 and 1. If we multiply this number with 2pi,
            // then we will get a range in between 0 and 2pi. Then we take the sine of this resulting angle, which
            // will be in between -1 and 1. Multiplying this result with `floatAmplitude` will give us the deviation
            // of the bird for the current time. Adding it with the initial y, will give us desired elevation.
            var y = initPos.y + Mathf.Sin((Time.time % floatPeriod) / floatPeriod * 2.0f * Mathf.PI) * floatAmplitude;
            transform.position = new Vector3(initPos.x, y, initPos.z);
        }

        // Bird is flying, calculate its new position.
        else if (birdState == BirdState.Flying)
        {
            // Update the vertical velocity of the bird.
            // Also calculate the average vertical velocity and use that when
            // calculating the displacement.
            var lastVerVel = currVerVel;
            currVerVel += gravAcc * Time.deltaTime;
            var avgVerVel = 0.5f * (lastVerVel + currVerVel);

            // Calculate the displacement of the bird both in x and y.
            var dx = constHorVel * Time.deltaTime;
            var dy = avgVerVel * Time.deltaTime;

            // Update the position of the bird.
            transform.position += new Vector3(dx, dy, 0.0f);
        }

        // When the bird is dying, it should be freely falling.
        else if (birdState == BirdState.Dying)
        {
            // Update the vertical velocity of the bird.
            // Also calculate the average vertical velocity and use that when
            // calculating the displacement.
            var lastVerVel = currVerVel;
            currVerVel += gravAcc * Time.deltaTime;
            var avgVerVel = 0.5f * (lastVerVel + currVerVel);

            // Calculate the displacement of the bird both in y.
            var dy = avgVerVel * Time.deltaTime;

            // Update the position of the bird.
            transform.position += new Vector3(0.0f, dy, 0.0f);
        }

        // The bird is dead, it cannot move.
        else if (birdState == BirdState.Dead)
        {
        }
    }

    private void UpdateRotation()
    {
        // While floating, the bird shouldn't rotate.
        if (birdState == BirdState.Floating)
        {
        }

        // When flying, the bird should rotate based on its vertical velocity.
        else if (birdState == BirdState.Flying)
        {
            // The bird's hould look steadily to `jumpAngle` if it has  vertical velocity
            // greater than a limit.
            if (currVerVel > -1.0f)
            {
                transform.rotation = Quaternion.Euler(0.0f, 0.0f, jumpAngle);
            }

            // Then it should change linearly in between `jumpAngle` and -90 degrees
            // based on its vertical velocity.
            else if (currVerVel > -5.0f)
            {
                // Implemented linear formula is a version of:
                // (rz - jumpAngle) / (currVerVel - jumpingVelLimit) = (-90 - jumpAngle) / (fallingVelLimit - jumpingVelLimit)
                var rz = (-90.0f - jumpAngle) / (fallingVelLimit - jumpingVelLimit) * (currVerVel - jumpingVelLimit) + jumpAngle;
                transform.rotation = Quaternion.Euler(0.0f, 0.0f, rz);
            }

            // If the vertical velocity is below a lower limit, then it should directly look
            // to ground.
            else
            {
                transform.rotation = Quaternion.Euler(0.0f, 0.0f, -90.0f);
            }
        }

        // If the bird is dying, then it should quickly be facing towards ground.
        else if (birdState == BirdState.Dying)
        {
            // When the bird is dying, its look direction should go down linearly
            // at a certain angular velocity (dyingRotVel) as the time passed.
            dyingRz += dyingRotVel * Time.deltaTime;

            // However, the bird should not rotate more once it looks to ground.
            dyingRz = Mathf.Max(dyingRz, -90.0f);
            transform.rotation = Quaternion.Euler(0.0f, 0.0f, dyingRz);
        }

        // Game is over, bird cannot rotate.
        else if (birdState == BirdState.Dead)
        {
        }
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        // If we are in the game and ...
        if (gameState == GameState.InGame)
        {
            // ... hit the sky, we can not jump anymore.
            if (other.tag.Equals("Sky"))
            {
                canJump = false;
            }

            // ... hit a pipe, the bird should begin to fall.
            else if (other.tag.Equals("Pipe"))
            {
                UpdateGameState(GameState.EndingGame);
                sfxHit.Play();
                sfxDie.PlayDelayed(0.5f);
            }

            // ... hit the the ground, the game should end.
            else if (other.tag.Equals("Ground"))
            {
                UpdateGameState(GameState.GameOver);
                sfxHit.Play();
            }
        }

        // If we hit a pipe before during the game and ...
        else if (gameState == GameState.EndingGame)
        {
            // ... hit the ground, the game should end.
            if (other.tag.Equals("Ground"))
            {
                UpdateGameState(GameState.GameOver);
            }
        }
    }

    private void OnTriggerExit2D(Collider2D other)
    {
        // If we hit the sky before and now exit it, we can jump.
        if (other.tag.Equals("Sky"))
        {
            canJump = true;
        }

        // If we exit a point detecter, tell UI to increment a point.
        // However, if we exit the point detector while the bird is dying,
        // that's not a score, so the bird should flying.
        else if (other.tag.Equals("PointDetector") && birdState == BirdState.Flying)
        {
            uiBehaviour.IncrementPoints();
        }
    }
}