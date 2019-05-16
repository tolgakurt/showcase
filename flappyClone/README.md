# A Flappy Bird Clone

Written using Unity framework. There is a live demo in [tolgakurt.info](http://tolgakurt.info/flappyClone)  

This is a game I developed for a custom console some years ago. The console was consisting of an Android box, a screen, a big red button, and a coin dispenser; so that the user should be able to play the game once they trigger the console with a single coin. I shooted a very amateur video of it [here](https://www.youtube.com/watch?v=CXxsyXM-y48).  

This version is just a modernized version of the game seen in the video, but a simplified version. I didn't spend much time polishing the game, like making a crash effect when the bird hits somewhere, animating UI items when they become active or inactive, etc.  

There are more than enough comments in the code, you can find explanations for all the business logic in the comments. However, I'll briefly introduce the overall structure of the game below.

## The Scene

The scene is composed of 4 main game objects: `Camera`, `UI`, `Bird`, and `Map`.  

`Camera` just holds the main camera and `CameraBehaviour` script. That script's whole purpose is to chase the bird horizontally.  

`UI` contains all the interface items: Get ready, tap to start, game over, current points counter, best score counter, etc. It displays and hides them based on `GameState` which is updated by `BirdBehaviour`.  

`Bird` contains the animations of the bird, sounds, and the main application logic in `BirdBehaviour`. I haven't used the built-in physics engine of Unity, I wrote some code to determine bird movement.  

`Map` contains the city scape, two ground images, upper limit (sky) and lower limit (ground), and the pipes. It also follows the bird horizontally while managing ground movement and pipe configurations.  