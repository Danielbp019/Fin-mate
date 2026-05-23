import { type Request, type Response } from 'express';
import type { PingResponse } from './ping.types.js';

export function ping(_req: Request, res: Response) {
  const response: PingResponse = {
    status: 'Pong',
    httpCode: 200,
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
}
