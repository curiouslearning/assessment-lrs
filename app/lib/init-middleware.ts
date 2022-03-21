import { NextApiRequest, NextApiResponse } from 'next';
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (a: any)=> void
)=> void;
export default function initMiddleware(middleware: Middleware) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}
