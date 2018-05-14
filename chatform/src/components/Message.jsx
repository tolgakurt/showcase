import React from "react";
import Paper from "material-ui/Paper";
import ListItem from "material-ui/List/ListItem";
import Avatar from "material-ui/Avatar";
import {white, blue500, greenA200} from 'material-ui/styles/colors';
import Emoji from 'material-ui/svg-icons/editor/insert-emoticon';
import "../styles/message.css"

function Message(props) {
    const jfAvatar = (
        <Avatar
            backgroundColor={greenA200}
            color={white}
        >
            JF
        </Avatar>
    );
    const humanAvatar = (
        <Avatar
            icon={<Emoji />}
            backgroundColor={blue500}
            color={white}
        />
    );
    const content = (
        <ListItem
            disabled={true}
            leftAvatar={ props.sender === "bot" ? jfAvatar : null }
            rightAvatar={props.sender === "human" ? humanAvatar : null}
        >
            <div className="text">{props.text}</div>
        </ListItem>
    );

    return (
        <div
            className="message"
            style={{
                textAlign: props.sender === "bot" ? "left" : "right"
            }}
        >
            <Paper
                style={{
                    maxWidth: 380,
                    fontWeight: 100,
                    textAlign: props.sender === "bot" ? "left" : "right",
                    display: "inline-block"
                }}
                zDepth={1}
                children={content}
            />
        </div>
    );
}

export default Message;
