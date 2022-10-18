import { RequestHandler } from "express";

export interface Controller {
  getAll: RequestHandler;
  get: RequestHandler;
  post: RequestHandler;
  put: RequestHandler;
  delete: RequestHandler;
}