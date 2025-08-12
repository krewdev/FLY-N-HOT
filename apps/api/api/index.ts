import app from '../src/app.js';

export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}


