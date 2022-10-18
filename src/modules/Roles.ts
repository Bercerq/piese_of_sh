import { Right, Rights } from "../models/Common";
import Constants from "./Constants";

export const getRights = (rights: string[]): Rights => {
  return transformRights(Constants.ACTIONS, rights);
}

export const getChildrenRights = (rights: string[]): Rights => {
  return transformRights(Constants.CHILDREN_ACTIONS, rights);
}

const transformRights = (actions: string[], rights: string[]): Rights => {
  let rightsObj: Rights = {};
  actions.forEach((action) => {
    rightsObj[action] = rights.indexOf(action) > -1;
  });
  return rightsObj;
}