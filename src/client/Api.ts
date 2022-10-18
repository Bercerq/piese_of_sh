import * as querystring from "qs";

interface ApiParams {
  path: string;
  qs?: any;
  body?: any;
  signal?: AbortSignal;
}

const buildUrl = (path: string, qs?: any): string => {
  if (qs) {
    return path + "?" + querystring.stringify(qs);
  }
  return path;
}

const getHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
}

const handleErrors = (res) => {
  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res;
}

export const Get = (params: ApiParams): Promise<any> => {
  const url = buildUrl(params.path, params.qs);
  const headers = getHeaders();
  const signal = params.signal;
  return fetch(url, { credentials: 'same-origin', headers, signal }).then(handleErrors).then(res => res.json());
}

export const Post = (params: ApiParams): Promise<any> => {
  const url = buildUrl(params.path, params.qs);
  const headers = getHeaders();
  const body = params.body ? JSON.stringify(params.body) : "";
  return fetch(url, { credentials: 'same-origin', headers, method: 'POST', body }).then(handleErrors).then(res => res.json());
}

export const PostForm = (params: ApiParams): Promise<any> => {
  const url = buildUrl(params.path, params.qs);
  return fetch(url, { credentials: 'same-origin', method: 'POST', body: params.body }).then(handleErrors).then(res => res.json());
}

export const Put = (params: ApiParams): Promise<any> => {
  const url = buildUrl(params.path, params.qs);
  const headers = getHeaders();
  const body = params.body ? JSON.stringify(params.body) : "";
  return fetch(url, { credentials: 'same-origin', headers, method: 'PUT', body }).then(handleErrors).then(res => res.json());
}

export const Delete = (params: ApiParams): Promise<any> => {
  const url = buildUrl(params.path, params.qs);
  const headers = getHeaders();
  return fetch(url, { credentials: 'same-origin', headers, method: 'DELETE' }).then(handleErrors).then(res => res.json());
}

export const getAbortController = (controller: AbortController): AbortController => {
  if (controller !== undefined) {
    controller.abort();
  }

  if ("AbortController" in window) {
    return new AbortController();
  }
  return undefined;
}

export const getSignal = (controller: AbortController) => {
  if (controller !== undefined) {
    return controller.signal;
  }
  return undefined
}