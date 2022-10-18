import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Public from "../public/Public";

render(<Router><Public /></Router>, document.getElementById("root"));