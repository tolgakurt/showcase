import React from "react";
import Tile from "./Tile.jsx"
import "../styles/board.css";

function Board(props) {
    return (
        <div className="board">
            {
                props.tiles.map((tile, index) => 
                    <Tile
                        key={tile.key}
                        value={tile.value}
                        top={tile.row * 121 + 15}
                        left={tile.col * 121 + 15}
                    />
                )
            }
        </div>
    );
}

export default Board;
