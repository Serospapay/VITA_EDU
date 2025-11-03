import { Request, Response } from 'express';

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
};



