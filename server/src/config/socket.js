import { Server } from 'socket.io';

import { env } from './env.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigins,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!rawToken) {
        return next();
      }

      const payload = verifyToken(rawToken);
      const user = await User.findById(payload.userId).select('-password');
      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.household) {
      socket.join(buildHouseholdRoom(socket.user.household));
    }

    socket.on('household:join', (householdId) => {
      if (householdId) {
        socket.join(buildHouseholdRoom(householdId));
      }
    });
  });

  return io;
}

export function emitHouseholdEvent(householdId, event, payload) {
  if (!io || !householdId) {
    return;
  }

  io.to(buildHouseholdRoom(householdId)).emit(event, payload);
}

function buildHouseholdRoom(householdId) {
  return `household:${householdId.toString()}`;
}
