import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import "../styles/main.css"
import JotConnector from "../utils/JotConnector.js"
import Home from "./Home.jsx"
import Chat from "./Chat.jsx"
import SubmissionViewer from "./SubmissionViewer.jsx"

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isConnected: false,
            form: null,
            questions: null,
            submissions: null
        };

        this.jotConnector = new JotConnector();
    }

    render() {
        return (
            <div className="main">
                <MuiThemeProvider>
                    <Router>
                        <div className="container">
                            <Route
                                exact path="/"
                                render={() => (
                                    <Home isConnected={this.state.isConnected} />
                                )}
                            />
                            <Route
                                path="/chat"
                                render={() => (
                                    <Chat
                                        form={this.state.form}
                                        questions={this.state.questions}
                                        onSubmit={(answers, callback) => {
                                            this.submitForm(answers, callback);
                                        }}
                                    />
                                )}
                            />
                            <Route
                                path="/submissionviewer"
                                render={() => (
                                    <SubmissionViewer
                                        submissions={this.state.submissions}
                                    />
                                )}
                            />
                        </div>
                    </Router>
                </MuiThemeProvider>
            </div>
        );
    }

    componentDidMount() {
        this.connect();
    }

    connect() {
        if (this.state.isConnected) return;

        try {
            this.jotConnector.connect((form, questions, submissions) => {
                this.loadData(form, questions, submissions);
            });
        }
        catch (exception) {
            console.log("JF not loaded. Will try again in 1 second.");
            setTimeout(() => {
                this.connect();
            }, 1000);
        }
    }

    loadData(form, questions, submissions) {
        this.setState({
            isConnected: true,
            form: form,
            // convert questions object to an array, filter non-questions, and sort
            // them by their order
            questions: Object
                .values(questions)
                .filter((question) => {
                    return ["control_head", "control_button"].indexOf(question.type) === -1;
                })
                .sort((q0, q1) => {
                    if (parseInt(q0.order, 10) < parseInt(q1.order, 10)) return -1;
                    if (parseInt(q0.order, 10) > parseInt(q1.order, 10)) return 1;
                    return 0;
                }),
            submissions: submissions
        });
    }

    submitForm(answers, callback) {
        this.jotConnector.submit(answers, (response, submissions) => {
            callback(response);
            this.setState({
                submissions: submissions
            });
        });
    }
}

export default Main;
