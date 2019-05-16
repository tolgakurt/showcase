using System.Collections.Generic;
using UnityEngine;

public class CounterBehaviour : MonoBehaviour
{
    public List<Sprite> numbers = new List<Sprite>();
    public GameObject digitPrefab;

    private List<GameObject> digits = new List<GameObject>();
    private readonly int maxDigitCount = 5;
    private readonly float letterSpacing = 0.04f;

    public void Start()
    {
        // Instantiate `maxDigitCount` amount of `digit` prefabs.
        for (int i = 0; i < maxDigitCount; i++)
        {
            var temp = Instantiate<GameObject>(digitPrefab);
            temp.transform.parent = gameObject.transform;
            digits.Add(temp);
        }
    }

    public void PrintPoints(int points)
    {
        // Set game object active (thus visible).
        gameObject.SetActive(true);

        // Deduce the number of digits required to write the points.
        var score = points.ToString();
        var digitCount = score.Length;

        // Determine the visibility of each digit.
        for (int i = 0; i < maxDigitCount; i++)
        {
            // If this is to be displayed ...
            if (i < digitCount)
            {
                // ... set it active ...
                digits[i].SetActive(true);

                //.. and get the index of the sprite that represents the number in
                // this digit. Let's say the point is 123 and we are trying to render
                // the second digit, 2. Then score.Substring(i, 1) will return `2` and
                // it will be parsed to 2. The `numbers` list should be filled with
                // sprites of the digits where the first item (index = 0) should represent
                // number 0, and second item (index = 1) should represent number 1, and so on.
                // By that virtue, we will get the sprite for this digit, by rendering
                // all necessary digits, we will render the whole point, 123.
                var numberIndex = int.Parse(score.Substring(i, 1));
                digits[i].GetComponent<SpriteRenderer>().sprite = numbers[numberIndex];
            }

            // This digit shouldn't be displayed.
            else
            {
                digits[i].SetActive(false);
            }
        }

        // We rendered all the digits, however, they are on top of each other. Separate
        // them by translating them by a fixed amount, `letterSpacing`.
        var currentLetterPosition = 0.0f;
        for (int i = 0; i < digitCount; i++)
        {
            digits[i].transform.localPosition = new Vector3(currentLetterPosition, 0f, 0f);
            currentLetterPosition += (letterSpacing + digits[i].GetComponent<SpriteRenderer>().sprite.bounds.size.x);
        }
    }

    public void Hide()
    {
        // Set all digits and game object inactive.
        for (int i = 0; i < maxDigitCount; i++)
        {
            digits[i].SetActive(false);
        }
        gameObject.SetActive(false);
    }
}