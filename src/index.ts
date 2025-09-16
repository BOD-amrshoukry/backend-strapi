// src/index.ts
import { Server } from 'socket.io';

export default {
  register() {
    // Optional: code before Strapi starts
  },

  async bootstrap({ strapi }) {
    // Create a new Socket.IO server attached to Strapi's HTTP server
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: 'http://localhost:5173', // replace with your frontend URL in production
        methods: ['GET', 'POST'],
      },
    });

    // Attach io to strapi for global access
    strapi.io = io;

    // Listen for client connections
    io.on('connection', (socket) => {
      console.log('New client connected', socket.id);

      // Example: join a user-specific room
      socket.on('joinChat', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`Socket ${socket.id} joined chat_${chatId}`);
      });

      socket.on('sendMessage', async (chatId) => {
        console.log('Wb3den');
        console.log(chatId);

        // Broadcast to all clients in the chat room except the sender
        socket.broadcast.to(`chat_${chatId}`).emit('receiveMessage', chatId);
      });

      socket.on('typing', ({ chatId, user }) => {
        socket.to(`chat_${chatId}`).emit('userTyping', { user });
      });

      socket.on('stopTyping', ({ chatId, user }) => {
        socket.to(`chat_${chatId}`).emit('userStopTyping', { user });
      });

      socket.on('joinNotificationRoom', () => {
        socket.join('notifications');
        console.log(`Socket ${socket.id} joined notifications room`);
      });
      socket.on('sendNotification', ({ recipientId, data }) => {
        // Broadcast only to sockets where we know the user is listening
        // Here we can use a mapping of userId -> socketId if needed
        console.log('SENDING NOTI');
        io.to('notifications').emit('receiveNotification', {
          recipientId,
          ...data,
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
      });
    });
  },
};

