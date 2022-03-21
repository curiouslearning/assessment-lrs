import { NextApiResponse } from 'next';

export  { errorHandler }

function errorHandler (
  err: any,
  res: NextApiResponse
): void {
  if (typeof(err) === 'string') {
    console.error(err);
    const is404 = err.toLowerCase().endsWith('not found');
    const statusCode = is404? 404:400;
    return res.status(statusCode).json({message: err})
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid Token'});
  }

  console.error(err);
  return res.status(500).json({ message: err.message });
}
