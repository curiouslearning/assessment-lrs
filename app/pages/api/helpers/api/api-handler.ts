import { NextApiRequest, NextApiResponse } from 'next';

import { errorHandler } from './error-handler'

export { apiHandler }

export default function apiHandler(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if(!req.method) return res.status(400).end('No method specified');
    const method = req.method.toLowerCase();

    if(!handler[method]) {
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
      await handler[method](req, res);
    } catch(err) {
      errorHandler(err, res);
    }
  }
}
