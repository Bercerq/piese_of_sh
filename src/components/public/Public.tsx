import * as React from "react";
import { Route, Switch } from "react-router-dom";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import SetPasswordForm from "./SetPasswordForm";


const Login = () => {
  return <Switch>
    <Route path="/login"><LoginForm /></Route>
    <Route path="/forgotPassword"><ForgotPasswordForm /></Route>
    <Route path="/newPassword"><SetPasswordForm /></Route>
  </Switch>;
}

export default Login;