using System;

public enum BirdState
{
    Floating = 0, // When the bird is flying steady in the `tap to start` state.
    Flying, // The bird responds to the user input.
    Dying, // The bird hit somewhere, falling to the ground.
    Dead // The bird is lying on the ground.
};