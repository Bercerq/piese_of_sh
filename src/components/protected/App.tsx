import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { AppUser } from "../../models/AppUser";
import UserContext from "./context/UserContext";
import ScopeDataProvider from "./context/ScopeDataProvider";
import PresetsProvider from "./context/PresetsProvider";
import AdqueueCountProvider from "./context/AdqueueCountProvider";
import Layout from "./layout/Layout";
import VariablesContext from "./context/VariablesContext";
import { Variables } from "../../models/Common";
import BreadcrumbProvider from "./context/BreadcrumbProvider";
import QsProvider from "./context/QsProvider";

const App = (props: { user: AppUser, variables: Variables }) => {
  return <Switch>
    <Route path="/:page/:scope/:scopeId/:tab?">
      <UserContext.Provider value={props.user}>
        <VariablesContext.Provider value={props.variables}>
          <ScopeDataProvider>
            <BreadcrumbProvider>
              <PresetsProvider>
                <AdqueueCountProvider>
                  <QsProvider>
                    <Layout />
                  </QsProvider>
                </AdqueueCountProvider>
              </PresetsProvider>
            </BreadcrumbProvider>
          </ScopeDataProvider>
        </VariablesContext.Provider>
      </UserContext.Provider>
    </Route>
  </Switch>;
}

export default App;