import { StatusCodes } from 'http-status-codes';

import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const token = header.replace('Bearer ', '');
  const payload = verifyToken(token);
  const user = await User.findById(payload.userId).select('-password');

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User session is invalid');
  }

  req.user = user;
  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have access to this action');
    }

    next();
  };
}
