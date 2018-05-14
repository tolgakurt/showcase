class JotConnector {
    constructor() {
        this.apiKey = "236864e69eb81d45d09d8acbcecee028";
        this.formId = "81326565287969";
    }

    connect(callback) {
        JF.initialize({
            apiKey: this.apiKey
        });

        JF.getForm(this.formId, (form) => {
            JF.getFormQuestions(this.formId, (questions) => {
                this.getSubmissions((submissions) => {
                    callback(form, questions, submissions);
                });
            });
        });
    }

    submit(answers, callback) {
        const submission = {};
        answers.forEach((answer) => {
            submission[answer.questionId] = answer.text || answer.value;
        });

        JF.createFormSubmission(this.formId, submission, (response) => {
            this.getSubmissions((submissions) => {
                callback(true, submissions);
            });
        }, (response) => {
            callback(false);
        });
    }

    getSubmissions(callback) {
        JF.getFormSubmissions(this.formId, (submissions) => {
            callback(submissions);
        });
    }
}

export default JotConnector;
