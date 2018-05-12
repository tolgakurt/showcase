import React from "react";
import "../styles/overlay.css";

function Overlay(props) {
    if (props.status === 0) return null;

    const message = (
        <div className="message">
            You {props.status === 1 ? "won" : "lost"} the game!
        </div>
    );

    const action = (
        <div className="actionButton">
            <button onClick={props.onClick}>Restart game!</button>
        </div>
    );

    return (
        <div className="overlay">
            {message}
            {action}
        </div>
    );
}

export default Overlay;
