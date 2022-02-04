import { NextRequest, NextResponse } from 'next/server';

import { errorHandler } from './error-handler'

export { apiHandler }

export default function apiHandler(handler) {
  return async (req: NextRequest, res: NextResponse) => {
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
