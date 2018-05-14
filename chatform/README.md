# A Chat Bot Implementation for JotForm
Written using React framework. There is a live demo in [tolgakurt.info](http://tolgakurt.info/chatform/public)  

This mini app is a chat bot implementation that connects to JotForm API with a predefined key and a form id. It retrieves the related form information, its questions, and previous submissions. User may enter the chat mode in which the questions are asked to the used one by one and results ares stored locally. Once all the questions are answered, they are submitted to the server and stored there.  

My intent was to implement a React app that can communicate with the JotForm API. Thus, less time is spent on polishing the app, like validating user answers, or building a pixel-precise layout.  

Some important packages used are `react-router-dom` to manage navigation, `react-scroll` to scroll to bottom of the chat screen whenever necessary, and `material-ui` for some visual components.  

You can install the dependencies and run the app with the following. I tried this with node v8.  
```
$ npm install
$ npm start
```

## Short summary of the custom components
`Message` and `Submission` are stateless components that render simple `Paper@material-ui` based elements. `Message` displays both the chat bot and user messages. `Submission` simply lists the answers contained in the given submission.  

`MessageInput` is the component that is responsible to handle user inputs. It mainly consists of two sub-components: a `TextField`/(list of `Chip`s) and an action button. When the question expects a choice from a dropdown or a radio group, a list of `Chip`s are displayed. Each `Chip` is rendered for an option. The answer is received upon a click on a `Chip`. When the question expects a free-text, a `TextField` and an action button is rendered. The answer is processed when the user clicks on the action button or presses enter key.  

`Chat` is the component in which the questions are asked and answers are stored. It renders `Message` components for the welcome message, the "thank" message, questions, and answers. It also renders the `MessageInput` component which handles user inputs. Whenever all the questions are answered, it calls the provided `onSubmit` function which actually triggers the `submitForm` method of the `Main` component.  

`SubmissionViewer` is also a stateless component that is provided with the previous submissions. It is responsible for rendering `Submission` elements.  

`Home` composes the entry screen which contains the title of the app, button links to the chat and submission viewer, and the source code link.  

`Main` is the component that configures the routing and communicates with the JotForm API.  

`JotConnector` is not a react component, but it wraps the JotForm API's JavaScript bindings.  
