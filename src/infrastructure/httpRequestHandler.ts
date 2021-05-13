import {RequestHandler as ExpressRequestHandler} from 'express';
import {IncomingMessage} from 'http';

type HTTPRequest = {
  params: any;
  query: any;
  body: any;
  originalUrl: string;
} & IncomingMessage;

type HTTPResponse = {
  status?: number;
  body?: any;
  view?: string;
};

type RequestHandler = (req: HTTPRequest) => Promise<HTTPResponse>;
export const httpReqHandler = (fn: RequestHandler): ExpressRequestHandler => {
  return async (req, res, next) => {
    await fn(req)
      .then((response) => {
        const {status, body, view} = response;
        if (view) return res.render(view, body);
        res.status(status || 200).json(body);
      })
      .catch(next);
  };
};
