
import * as React from "react";
import { RequestHandler } from "express";
import { renderToString } from "react-dom/server";
import { StaticRouter as Router } from "react-router-dom";
import * as _ from "lodash";
import * as querystring from "qs";
import * as config from "../../config";
import Public from "../components/public/Public";
import publicIndex from "../templates/publicIndex";
import index from "../templates/index";
import AuthorizationService from "./AuthorizationService";
import App from "../components/protected/App";
import { AppUser } from "../models/AppUser";
import { UserRole } from "../models/data/User";
import { Variables } from "../models/Common";

const fetch = require('node-fetch');



export const publicGetHandler: RequestHandler = (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    const context: any = {};
    if (context.url) {
      return res.redirect(302, context.url);
    }
    const markup = renderToString(
      <Router location={req.url} context={context}>
        <Public />
      </Router>
    );
    return res.status(200).send(publicIndex(markup));
  }
};

export const newPasswordHandler: RequestHandler = (req, res) => {
  if (req.user) {
      req.logout();
  }
  const markup = renderToString(
    <Router location={req.url}>
      <Public />
    </Router>
  );
  return res.status(200).send(publicIndex(markup));
}

export const loginPostHandler = (passport: any): RequestHandler => (req, res, next) => {
  const verificationCode = req.body.verificationCode;
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    let verified = await getVerification(verificationCode, {username: req.body.username, password: req.body.password});
    if (!verified) {
      return res.status(500).send("Wrong 2fa token");
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).send('An error occured while login. Try again.');
      } else {
        
        const role = req.body.role;
        let mainRole;
        if (role !== "") {
          try { mainRole = JSON.parse(role); } catch (err) { }
        }
        if (mainRole) {
          req.session[user.email + "-role"] = mainRole;
        }
        return res.json({ msg: "OK" });
      }
    });
  })(req, res, next);
}

async function getVerification(verificationCode, credentials)  {
  const url = config.backend + "/users/me/verifyCode";
  console.log("POST: ", url);
  const headers = {
    'Content-Type': "application/json",
    'Authorization': "Basic " + Buffer.from(credentials.username + ":" + credentials.password).toString("base64"),
    'Proxy-Authorization': Buffer.from(config.dashboarduser + ":" + config.dashboardpass).toString("base64")
  };
  var response = await fetch(url, { method: 'POST', timeout: config.timeout, headers, body: verificationCode });
  var result = await response.json();

  return result;
}

export const logoutHandler = (req, res) => {
  req.logout();
  res.redirect("/");
}

export const localStrategyHandler = (authService: AuthorizationService) => async (username, password, done) => {
  try {
    const appUser = await authService.authorize({ username, password });
    done(null, appUser);
  } catch (err) {
    done(err);
  }
}

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    if ((req.session as any).redirectUrl) { // if the user requested a url before authentication redirect there and delete the session variable
      const redirectUrl = (req.session as any).redirectUrl;
      delete (req.session as any).redirectUrl;
      res.redirect(redirectUrl);
    } else {
      next();
    }
  } else {
    (req.session as any).redirectUrl = req.url;
    res.redirect('/login');
  }
}

export const sessionPostHandler: RequestHandler = (req, res) => {
  const { key, value } = req.body;
  req.session[key] = value;
  res.json({ msg: "OK" });
}

export const rootGetHandler: RequestHandler = (req, res) => {
  const mainRole = getMainRole(req);
  const redirectUrl = getRedirectUrl(req, mainRole);
  res.redirect(redirectUrl);
}

export const universalGetHandler: RequestHandler = (req, res) => {
  const context: any = {};
  let status = 200;
  if (context.url) {
    return res.redirect(302, context.url);
  }

  if (context.is404) {
    status = 404;
  }
  let user = req.user as AppUser;
  delete user.password;
  const variables: Variables = {
    adServerUrl: config.adServerUrl
  }
  const markup = renderToString(
    <Router location={req.url} context={context}>
      <App user={user} variables={variables} />
    </Router>
  );
  return res.status(status).send(index(markup, user, variables));
};

const getMainRole = (req) => {
  const user = req.user as AppUser;
  let mainRole = req.session[user.email + "-role"] as UserRole;
  if (mainRole) {
    mainRole = AuthorizationService.findRole(user, mainRole.level, mainRole.entityId); //make sure the user still has the saved in memory role
  }
  if (!mainRole) {
    mainRole = user.roles[0];
    req.session[user.email + "-role"] = mainRole;
  }
  return mainRole;
}

const getRedirectUrl = (req, mainRole: UserRole) => {
  let qs = "";
  if (Object.keys(req.query).length !== 0) {
    qs = "?" + querystring.stringify(req.query);
  }
  
  if (mainRole.level === "publisher") {
    return `/analytics/${mainRole.level}/${mainRole.entityId}${qs}`;
  } else if (mainRole.role === "tagmanager") {
    return `/segments/${mainRole.level}/${mainRole.entityId}${qs}`;
  } else {
    return `/settings/${mainRole.level}/${mainRole.entityId}${qs}`;
  }
}

