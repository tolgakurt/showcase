import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AppBar from "material-ui/AppBar";
import IconButton from "material-ui/IconButton";
import ChevronLeft from "material-ui/svg-icons/navigation/chevron-left";
import "../styles/submissionViewer.css"
import Submission from "./Submission.jsx"

function SubmissionViewer(props) {
    return (
        <div className="submissionViewer">
            <Route
                render={(match) => (
                    <AppBar
                        title="Submissions To Your Form"
                        iconElementLeft={<IconButton><ChevronLeft /></IconButton>}
                        onLeftIconButtonClick={() => { match.history.push('/') }}
                    />
                )}
            />
            <div className="submissions">
                {
                    props.submissions.map((submission) => (
                        <Submission
                            key={"submission" + submission.id}
                            data={submission}
                        />
                    ))
                }
            </div>
        </div>
    );
}

export default SubmissionViewer;
