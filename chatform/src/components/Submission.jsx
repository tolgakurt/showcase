import React from "react";
import Paper from "material-ui/Paper";
import "../styles/submission.css"

function Submission(props) {
    const submission = props.data;

    const content = [];
    content.push((
        <div
            key="createdAt"
            className="item"
        >
            <b>Created at:</b> {submission.createdAt}
        </div>
    ));

    const questionIds = Object.keys(submission.answers);

    questionIds.forEach((questionId) => {
        const answer = submission.answers[questionId];
        content.push((
            <div
                key={"answer" + questionId}
                className="item"
            >
                <b>{answer.text}:</b> {answer.answer}
            </div>
        ));
    });

    return (
        <div className="submission">
            <Paper
                style={{
                    maxWidth: 400,
                    fontWeight: 100,
                    padding: 10,
                    margin: 10,
                    display: "inline-block"
                }}
                zDepth={1}
                children={content}
            />
        </div>
    );
}

export default Submission;
