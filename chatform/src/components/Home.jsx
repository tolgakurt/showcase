import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import "../styles/home.css"

function Home(props) {
    return (
        <div>
            <AppBar
                title="Welcome to JotForm Chat Bot"
                showMenuIconButton={false}
                style={{ textAlign: "center" }}
            />

            <div className="status">
                JotForm API is {props.isConnected ? "connected" : "not connected"}!
            </div>

            <div className="navigation">
                <Link to={props.isConnected ? "/chat" : "/"}>
                    <RaisedButton
                        label="Fill Form Using Chat Bot"
                        disabled={!props.isConnected}
                        primary={props.isConnected}
                        fullWidth={true}
                        style={{ marginBottom: "50px" }}
                    />
                </Link>
                <Link to={props.isConnected ? "/submissionviewer" : "/"}>
                    <RaisedButton
                        label="View Submissions"
                        disabled={!props.isConnected}
                        secondary={props.isConnected}
                        fullWidth={true}
                    />
                </Link>
            </div>

            <div className="source">
                find the code at <a href="https://github.com/tolgakurt/showcase/tree/master/chatform" target="_blank">GitHub</a>
            </div>
        </div>
    );
}

export default Home;
