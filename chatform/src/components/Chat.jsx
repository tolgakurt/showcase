import React from "react";
import { animateScroll } from "react-scroll";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AppBar from "material-ui/AppBar";
import IconButton from "material-ui/IconButton";
import ChevronLeft from "material-ui/svg-icons/navigation/chevron-left";
import "../styles/chat.css"
import Message from "./Message.jsx"
import MessageInput from "./MessageInput.jsx"

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentQuestionIndex: 0,
            answers: [],
            readyToSubmit: false,
            submitSuccess: false,
            submitFail: false,
        };
    }

    render() {
        const currentQuestion = this.props.questions[this.state.currentQuestionIndex];
        return (
            <div className="chat">
                <Route
                    render={(match) => (
                        <AppBar
                            title={this.props.form.title}
                            iconElementLeft={<IconButton><ChevronLeft /></IconButton>}
                            onLeftIconButtonClick={() => { match.history.push('/') }}
                        />
                    )}
                />
                <div className="messages" id="messages">
                    {this.createMessages()}
                    {this.state.submitSuccess ? this.createSuccessMessage() : null}
                    {this.state.submitFail ? this.createFailMessage() : null}
                </div>
                <MessageInput
                    question={currentQuestion}
                    onAnswer={(questionId, value, text) => {
                        this.answerQuestion(questionId, value, text);
                    }}
                />
            </div>
        );
    }

    componentDidUpdate() {
        animateScroll.scrollToBottom({
            containerId: "messages"
        });

        if (this.state.readyToSubmit) {
            this.props.onSubmit(this.state.answers, (result) => {
                if (result) {
                    this.setState({
                        readyToSubmit: false,
                        submitSuccess: true
                    });
                }
                else {
                    this.setState({
                        readyToSubmit: false,
                        submitFail: true
                    });
                }
            });
        }
    }

    answerQuestion(questionId, value, text) {
        const answers = this.state.answers.slice();
        answers.push({
            questionId: questionId,
            value: value,
            text: text
        });
        this.setState({
            currentQuestionIndex: this.state.currentQuestionIndex + 1,
            answers: answers,
            readyToSubmit: this.state.currentQuestionIndex + 1 === this.props.questions.length
        });
    }

    createWelcomeMessage() {
        return (
            <Message
                key="welcome"
                sender="bot"
                text="Hi there! Let's customize your cake and place your order."
            />
        );
    }

    createSuccessMessage() {
        return (
            <Message
                key="submitSuccess"
                sender="bot"
                text="Thanks for answering all questions. We will prepare and deliver your fantastic cake :)"
            />
        );
    }

    createFailMessage() {
        return (
            <Message
                key="submitFail"
                sender="bot"
                text="I regret to say that there was a problem sending your request :( Will you please try again later?"
            />
        );
    }

    createQuestion(index) {
        const question = this.props.questions[index];
        return (
            <Message
                key={"question" + question.qid}
                sender="bot"
                text={question.text}
            />
        );
    }

    createAnswer(index) {
        const answer = this.state.answers[index];
        return (
            <Message
                key={"answer" + index}
                sender="human"
                text={answer.text || answer.value}
            />
        );
    }

    createMessages() {
        const messages = [this.createWelcomeMessage()];

        for (let i = 0; i <= this.state.currentQuestionIndex; i++) {
            if (this.props.questions[i]) messages.push(this.createQuestion(i));
            if (this.state.answers[i]) messages.push(this.createAnswer(i));
        }

        return messages;
    }
}

export default Chat;
