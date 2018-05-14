import React from "react";
import TextField from "material-ui/TextField";
import Chip from "material-ui/Chip";
import FloatingActionButton from "material-ui/FloatingActionButton";
import ContentSend from "material-ui/svg-icons/content/send";
import "../styles/messageInput.css"

class MessageInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          value: ""
        };
    }

    render() {
        let sendButtonDisabled = false;
        let userInput = null;
        if (this.props.question) {
            switch (this.props.question.type) {
                case "control_textbox":
                case "control_textarea":
                case "control_phone":
                case "control_email":
                    userInput = (<TextField
                        id="userMessage"
                        underlineShow={false}
                        style={{
                            width: 360
                        }}
                        value={this.state.value}
                        onChange={(event) => { this.handleChange(event); }}
                        onKeyPress={(event) => {
                            if (event.key === "Enter") {
                                this.sendTextMessage();
                                event.preventDefault();
                            }
                        }}
                    />);
                    break;

                case "control_dropdown":
                case "control_radio":
                    const options = this.props.question.options.split("|");
                    userInput = options.map((option, index) => {
                        return (
                            <Chip
                                key={"question" + this.props.question.qid + "option" + index}
                                style={{
                                    marginTop: 10,
                                    marginBottom: 10,
                                    marginLeft: 5,
                                    marginRight: 5,
                                    float: "left"
                                }}
                                onClick={() => { this.sendOption(index, option); }}
                            >
                                {option}
                            </Chip>
                        );
                    });
                    sendButtonDisabled = true;
                    break;
            }
        }
        else {
            userInput = (<TextField
                id="userMessage"
                disabled={true}
                underlineShow={false}
                style={{
                    width: 360
                }}
            />);
            sendButtonDisabled = true
        }

        return (
            <div className="messageInput">
                {userInput}
                <FloatingActionButton
                    mini={true}
                    style={{
                        float: "right"
                    }}
                    onClick={() => { this.sendTextMessage(); }}
                    disabled={sendButtonDisabled}
                >
                    <ContentSend />
                </FloatingActionButton>
            </div>
        );
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });
    }

    sendTextMessage() {
        if (this.state.value === "") return;
        this.props.onAnswer(this.props.question.qid, this.state.value);
        this.setState({
            value: ""
        });
    }

    sendOption(value, option) {
        this.props.onAnswer(this.props.question.qid, value, option);
    }
}

export default MessageInput;
