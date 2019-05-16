using System;

public enum GameState
{
    PreGame = 0, // In the `tap to start` screen.
    InGame, // User is playing, bird is flying.
    EndingGame, // Bird hit somewhere, falling to ground.
    GameOver // Bird is dead, scores are shown.
};