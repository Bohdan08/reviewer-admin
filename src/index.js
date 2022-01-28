import React from "react";
import ReactDOM from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";
import history from "./utils/history";
import App from "./App";

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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);
