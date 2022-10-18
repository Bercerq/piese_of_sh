import * as React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "../protected/App";

hydrate(<Router><App user={(window as any).__APP_USER__} variables={(window as any).__APP_VARS__} /></Router>, document.getElementById("root"));