import React from "react";
import ReactDOM from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import history from "./utils/history";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// styles
import "./index.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};


const providerConfig = {
  domain: process.env.REACT_APP_AUTH_DOMAIN,
  clientId: process.env.REACT_APP_AUTH_CLIENT_ID,
  redirectUri: window.location.origin,
  onRedirectCallback,
};

ReactDOM.render(
  <Auth0Provider {...providerConfig}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
