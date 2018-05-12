import React from "react";
import Board from "./Board.jsx"
import Overlay from "./Overlay.jsx"
import Loop from "../utils/Loop.js"
import "../styles/game.css";

const settings = {
    maxRow: 4,
    maxCol: 3,
    creationTimeout: 200,
    sideTimeout: 200,
    downTimeout: 50,
    forceDownTimeout: 1000
};

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tiles: [],
            lastTileId: 0,
            isMoveComplete: true,
            maxValue: 2,
            gameWon: false,
            gameLost: false
        };

        // the game loop that executes this.update as per window.requestAnimationFrame
        this.loop = new Loop();

        // a flag that is set to false when a state change is requested and set to true
        // when the component is updated.
        this.readyForUpdate = true;

        this.action = null;

        // last time that the latest tile ...
        this.lastSide = 0; // ... moved to the left or right.
        this.lastDown = 0; // ... moved down by the user action.
        this.lastForceDown = 0; // ... moved down automatically due to timeout.
    }

    // generates a value for the newly created tile
    generateValue() {
        const possible = [];
        let maxValue = this.state.maxValue;
        while (maxValue > 1) {
            // the maximum value can be 16
            if (maxValue < 32) {
                possible.push(maxValue);
            }
            maxValue /= 2;
        }
        // return one of the possible values randomly.
        return possible[Math.floor(Math.random() * Math.floor(possible.length))];

        // this randomization above should be poisson dist. in which the smaller values have a
        // greater chance to be generated.
    }

    // create a tile at the top row with a random value
    createTile() {
        const tiles = this.state.tiles.slice();
        tiles.push({
            key: "tile" + this.state.lastTileId++,
            value: this.generateValue(),
            row: 0,
            col: Math.floor(Math.random() * Math.floor(4))
        });
        this.readyForUpdate = false;
        this.setState({
            tiles: tiles,
            isMoveComplete: false
        });
    }

    winGame() {
        this.readyForUpdate = false;
        this.setState({
            gameWon: true
        });
    }

    loseGame() {
        this.readyForUpdate = false;
        this.setState({
            gameLost: true
        });
    }

    // this method is passed to overlay, and triggered by the button there.
    restartGame() {
        this.setState({
            tiles: [],
            lastTileId: 0,
            isMoveComplete: true,
            maxValue: 2,
            gameWon: false,
            gameLost: false
        });
    }

    update() {
        // if a state change is pending, do not update anything
        if (this.readyForUpdate === false) return;

        // if the game is ended, wait until the user restarts the game
        if (this.state.gameWon || this.state.gameLost) return;

        // if the maximum value of any tile hits 2048, end the game
        if (this.state.maxValue === 2048) {
            this.winGame();
            return;
        }

        const now = Date.now();

        // if the last tile's movement is complete, create a new tile and return
        if (this.state.isMoveComplete) {
            this.lastCreation = now;
            this.lastForceDown = now;
            this.createTile();
            return;
        }

        // give time to user so that he can see the newly created tile and decides on a move
        if (now - this.lastCreation < settings.creationTimeout) return;

        const tiles = this.state.tiles.slice();
        const lastTile = tiles[tiles.length - 1];

        let newRow = lastTile.row;
        let newCol = lastTile.col;

        // if enough time is passed since the user last move sideways ...
        if (now - this.lastSide > settings.sideTimeout) {

            // .. and user wants to move again to either left or right, register the new column.
            if (this.action === "left") {
                newCol = Math.max(0, lastTile.col - 1);
                this.lastSide = now;
            }
            else if (this.action === "right") {
                newCol = Math.min(settings.maxCol, lastTile.col + 1);
                this.lastSide = now;
            }
        }

        // if enough time is passed since the moving tile move downwards ...
        if (now - this.lastDown > settings.downTimeout) {

            // ... and the user wants a quicker fall ...
            if (this.action === "down") {
                newRow = Math.min(settings.maxRow, lastTile.row + 1);
                this.lastDown = now;
            }

            // ... or enough time has passed for a forced down move, register the new row.
            else if (now - this.lastForceDown > settings.forceDownTimeout) {
                newRow = Math.min(settings.maxRow + 1, lastTile.row + 1);
                this.lastForceDown = now;
            }
        }

        // is there already a tile at moving tile's new position? (attention: we are not looking
        // at the the last tile, since it is the moving tile.)
        const oldTileIndex = tiles.slice(0, tiles.length - 1).findIndex((tile) => {
            return tile.row === newRow && tile.col === newCol;
        });

        // if there is ...
        if (oldTileIndex !== -1) {
            // ... it may be of the same value, thus they can be merged.
            if (tiles[oldTileIndex].value === lastTile.value) {
                tiles.splice(oldTileIndex, 1); // remove the old tile.
                lastTile.value *= 2; // double up the moving tile.
                lastTile.row = newRow;
                lastTile.col = newCol;
                this.lastForceDown = now;
                this.readyForUpdate = false;
                this.setState({
                    tiles: tiles,
                    maxValue: Math.max(this.state.maxValue, lastTile.value)
                });
                return;
            }

            // ... they may have different values, and cannot be merged.
            else {

                // the old tile may be under the moving tile ...
                if (tiles[oldTileIndex].row === lastTile.row + 1) {

                    // ... and our moving tile is at the top row ...
                    if (lastTile.row === 0) {

                        // ... which means we cannot go down, and lose the game.
                        this.loseGame();
                    }

                    // .. and our tile needs to stop without relocating.
                    else {
                        this.readyForUpdate = false;
                        this.setState({
                            isMoveComplete: true
                        });
                    }
                    return;
                }

                // the old tile is not under, thus it is at the side, so we cancel column update.
                else {
                    newCol = lastTile.col;
                    return;
                }
            }
        }

        // the moving tile has reached the bottom row, actually, it spent some time at the
        // bottom row and now trying to go below it, which is impossible. so we end its movement.
        if (newRow === settings.maxRow + 1) {
            lastTile.row = settings.maxRow;
            this.readyForUpdate = false;
            this.setState({
                tile: tiles,
                isMoveComplete: true
            });
            return;
        }

        // no interruptions for the movement of the tile, we update its position.
        lastTile.row = newRow;
        lastTile.col = newCol;

        this.readyForUpdate = false;
        this.setState({
            tiles: tiles
        });
    }

    // a keydown event is triggered. if it is something relevant, then register it.
    onKeyDown(event) {
        if (!event) return;

        switch (event.keyCode) {
            case 37: // left arrow
                this.action = "left";
                break;

            case 39: // right arrow
                this.action = "right";
                break;

            case 40: // down arrow
                this.action = "down";
                break;
        }
    }

    // key is up, revert keydown.
    onKeyUp(event) {
        this.action = null;
    }

    registerKeys() {
        window.addEventListener('keydown', (event) => { this.onKeyDown(event); });
        window.addEventListener('keyup', (event) => { this.onKeyUp(event); });
    }

    unregisterKeys() {
        window.removeEventListener('keydown');
        window.removeEventListener('keyup');
    }

    render() {
        return (
            <div className="game">
                <Board tiles={this.state.tiles} />
                <Overlay
                    status={this.state.gameWon ? 1 : (this.state.gameLost ? -1 :0)}
                    onClick={() => { this.restartGame(); }}
                />
                <div className="information">
                    Use the arrow keys on your keyboard. Hit 2048 to win the game. <br />
                    A Tetris 2048 clone written in React. You can find the code at <a href="https://github.com/tolgakurt/showcase/tree/master/tetris2048" target="_blank">GitHub</a>
                </div>
            </div>
        );
    }

    // when the component is ready, register key event listeners and start the game loop
    componentDidMount() {
        this.registerKeys();
        // beware: `this.loop.start(this.update)`` will not work, since `this` will resolve to
        // loop's context. thus we utilize lexical scoping, for `this` to refer to component's
        // context.
        this.loop.start(() => this.update());
    }

    // when the component is about to be disposed, unregister the listeners, and stop the loop.
    componentWillUnmount() {
        this.unregisterKeys();
        this.loop.stop();
    }

    // component is re-rendered, so we are ready for changes that may take place in update
    // method in the next tick of the game loop.
    componentDidUpdate() {
        this.readyForUpdate = true;
    }
}

export default Game;
