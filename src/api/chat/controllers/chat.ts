// src/api/chat/controllers/chat.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::chat.chat',
  ({ strapi }) => ({
    async getUserChats(ctx) {
      const currentUserId = ctx.state.user.id;

      const { page = 1, limit = 10, search = '' } = ctx.query;
      const start = (Number(page) - 1) * Number(limit);

      // Find total count of chats
      const total = await strapi.db.query('api::chat.chat').count({
        where: {
          $or: [{ user1: currentUserId }, { user2: currentUserId }],
        },
      });

      // Fetch paginated chats
      const chats = await strapi.db.query('api::chat.chat').findMany({
        where: {
          $or: [{ user1: currentUserId }, { user2: currentUserId }],
          ...(search
            ? {
                $or: [
                  { user1: { name: { $containsi: search } } },
                  { user2: { name: { $containsi: search } } },
                ],
              }
            : {}),
        },
        populate: ['user1', 'user2', 'messages', 'messages.sender'],
        orderBy: { updatedAt: 'desc' },
        offset: start,
        limit: Number(limit),
      });

      // For each chat → calculate unread count
      const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
          const isUser1 = chat.user1.id === currentUserId;
          const unreadCount = await strapi.db
            .query('api::message.message')
            .count({
              where: {
                chat: chat.id,
                ...(isUser1 ? { isRead1: false } : { isRead2: false }),
              },
            });

          console.log(chat);
          console.log(isUser1);
          console.log(unreadCount);

          return {
            ...chat,
            unreadCount,
          };
        }),
      );

      const totalPages = Math.ceil(total / Number(limit));

      return {
        data: chatsWithUnread,
        meta: {
          page: Number(page),
          pageSize: Number(limit),
          total,
          totalPages,
        },
      };
    },
    async usersWithoutChat(ctx) {
      const currentUserId = ctx.state.user.id;
      const { page = 1, limit = 10, search = '' } = ctx.query;
      const start = (Number(page) - 1) * Number(limit);

      // 1️⃣ Get all chats where current user is involved
      const chats = await strapi.db.query('api::chat.chat').findMany({
        where: {
          $or: [
            { user1: { id: currentUserId } },
            { user2: { id: currentUserId } },
          ],
        },
        populate: ['user1', 'user2'],
      });

      // 2️⃣ Collect user IDs who already have a chat with current user
      const usersWithChat = new Set();
      chats.forEach((chat) => {
        if (chat.user1 && chat.user1.id !== currentUserId)
          usersWithChat.add(chat.user1.id);
        if (chat.user2 && chat.user2.id !== currentUserId)
          usersWithChat.add(chat.user2.id);
      });

      // 3️⃣ Build filter
      const where = {
        id: { $notIn: [currentUserId, ...Array.from(usersWithChat)] },
        ...(search ? { name: { $containsi: search } } : {}),
      };

      // Count total
      const total = await strapi.db
        .query('plugin::users-permissions.user')
        .count({ where });

      // Paginated users
      const users = await strapi.db
        .query('plugin::users-permissions.user')
        .findMany({
          where,
          select: ['id', 'username', 'email', 'name'],
          offset: start,
          limit: Number(limit),
          orderBy: { username: 'asc' },
        });

      const totalPages = Math.ceil(total / Number(limit));

      return {
        data: users,
        meta: {
          page: Number(page),
          pageSize: Number(limit),
          total,
          totalPages: totalPages,
        },
      };
    },

    async create(ctx) {
      try {
        const { userId, message } = ctx.request.body;

        if (!userId) {
          return ctx.badRequest('userId is required');
        }

        // Replace this with your logged-in user ID from ctx.state.user
        const currentUserId = ctx.state.user.id;

        // Check if a chat already exists between the two users
        const existingChat = await strapi.db.query('api::chat.chat').findOne({
          where: {
            $or: [
              { user1: currentUserId, user2: userId },
              { user1: userId, user2: currentUserId },
            ],
          },
        });

        if (existingChat) {
          return ctx.send({
            chat: existingChat,
            message: 'Chat already exists',
          });
        }

        // Create new chat
        const newChat = await strapi.db.query('api::chat.chat').create({
          data: {
            user1: currentUserId,
            user2: userId,
          },
        });

        // Create the first welcoming message
        const firstMessage = await strapi.db
          .query('api::message.message')
          .create({
            data: {
              chat: { connect: [{ id: newChat.id }] },
              sender: { connect: [{ id: currentUserId }] },
              text: message || 'User has started the chat',
            },
          });

        ctx.send({
          chat: newChat,
          firstMessage,
        });
      } catch (err) {
        console.error(err);
        ctx.internalServerError('Failed to create chat');
      }
    },

    async sendMessage(ctx) {
      const { id } = ctx.params; // chat ID
      const { text } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!text || !text.trim()) {
        return ctx.badRequest('Message text is required');
      }

      try {
        // Ensure chat exists
        const chat = await strapi.db.query('api::chat.chat').findOne({
          where: { id: Number(id) },
          populate: ['user1', 'user2'],
        });

        if (!chat) {
          return ctx.notFound('Chat not found');
        }

        let isRead1 = false;
        let isRead2 = false;

        if (chat.user1.id === userId) {
          // Sender is user1, so they have read it, user2 has not
          isRead1 = true;
          isRead2 = false;
        } else if (chat.user2.id === userId) {
          // Sender is user2, so they have read it, user1 has not
          isRead1 = false;
          isRead2 = true;
        } else {
          return ctx.badRequest('Sender is not part of this chat');
        }

        // Create the message
        const message = await strapi.db.query('api::message.message').create({
          data: {
            text,
            chat: { connect: [{ id: Number(id) }] }, // ✅ proper relation
            sender: { connect: [{ id: userId }] }, // ✅ proper relation
            isRead1,
            isRead2,
          },
          populate: ['sender'],
        });

        return message;
      } catch (err) {
        console.error(err);
        ctx.internalServerError('Failed to send message');
      }
    },

    async findOne(ctx) {
      const { id } = ctx.params;
      const { page = 1, pageSize = 20 } = ctx.query;

      // 1️⃣ Get the chat without all messages
      const chat = await strapi.db.query('api::chat.chat').findOne({
        where: { id: Number(id) },
        populate: {
          user1: true,
          user2: true,
        },
      });

      if (!chat) {
        return ctx.notFound('Chat not found');
      }

      console.log('CHAT is', chat);

      // 2️⃣ Get paginated messages separately
      const [messages, total] = await Promise.all([
        strapi.db.query('api::message.message').findMany({
          where: { chat: id },
          orderBy: { createdAt: 'desc' }, // latest first
          limit: Number(pageSize),
          offset: (Number(page) - 1) * Number(pageSize),
          populate: { sender: true },
        }),
        strapi.db.query('api::message.message').count({
          where: { chat: id },
        }),
      ]);

      // 3️⃣ Attach messages to chat
      chat.messages = messages;

      return {
        data: chat,
        meta: {
          page: Number(page),
          pageSize: Number(pageSize),
          total,
          pageCount: Math.ceil(total / Number(pageSize)),
        },
      };
    },

    async getTotalUnreadMessages(ctx) {
      const currentUserId = ctx.state.user.id;

      try {
        // Count unread messages for the current user
        const totalUnread = await strapi.db
          .query('api::message.message')
          .count({
            where: {
              $or: [
                {
                  chat: { user1: currentUserId },
                  isRead1: false,
                },
                {
                  chat: { user2: currentUserId },
                  isRead2: false,
                },
              ],
            },
          });

        return { totalUnread };
      } catch (err) {
        console.error(err);
        ctx.internalServerError('Failed to get unread messages count');
      }
    },

    async markChatAsRead(ctx) {
      const currentUserId = ctx.state.user.id;
      const { chatId } = ctx.params;

      if (!chatId) return ctx.badRequest('Chat ID is required');

      try {
        // Get the chat with users
        const chat = await strapi.db.query('api::chat.chat').findOne({
          where: { id: chatId },
          populate: ['user1', 'user2'],
        });
        if (!chat) return ctx.notFound('Chat not found');

        // Figure out which flag to update
        const isUser1 = chat.user1?.id === currentUserId;
        const field = isUser1 ? 'isRead1' : 'isRead2';

        // Step 1: get message IDs
        const messages = await strapi.db
          .query('api::message.message')
          .findMany({
            where: { chat: chatId, [field]: false },
            select: ['id'],
          });

        const ids = messages.map((m) => m.id);
        if (ids.length === 0) return { success: true, updated: 0 };

        // Step 2: update by IDs
        await strapi.db.query('api::message.message').updateMany({
          where: { id: { $in: ids } },
          data: { [field]: true },
        });

        return { success: true, updated: ids.length };
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to mark chat as read');
      }
    },

    async markAllChatsAsRead(ctx) {
      const currentUserId = ctx.state.user.id;

      try {
        // Fetch all chats where the user is involved
        const chats = await strapi.db.query('api::chat.chat').findMany({
          where: {
            $or: [{ user1: currentUserId }, { user2: currentUserId }],
          },
          populate: ['user1', 'user2'], // these are objects, not arrays
        });

        if (!chats?.length) return { success: true, updated: 0 };

        let totalUpdated = 0;

        for (const chat of chats) {
          // Determine which flag to update
          let field: 'isRead1' | 'isRead2';
          if (chat.user1?.id === currentUserId) {
            field = 'isRead1';
          } else if (chat.user2?.id === currentUserId) {
            field = 'isRead2';
          } else {
            continue; // user not part of this chat, skip
          }

          // Get unread message IDs
          const unreadMessages = await strapi.db
            .query('api::message.message')
            .findMany({
              where: { chat: chat.id, [field]: false },
              select: ['id'],
            });

          const ids = unreadMessages.map((m) => m.id);
          if (!ids.length) continue;

          await strapi.db.query('api::message.message').updateMany({
            where: { id: { $in: ids } },
            data: { [field]: true },
          });

          totalUpdated += ids.length;
        }

        return { success: true, updated: totalUpdated };
      } catch (err) {
        console.error('markAllChatsAsRead error:', err);
        return ctx.internalServerError('Failed to mark all chats as read');
      }
    },

    async getAllUserChats(ctx) {
      const currentUserId = ctx.state.user.id;

      try {
        // Fetch all chats where the user is user1 or user2
        const chats = await strapi.db.query('api::chat.chat').findMany({
          where: {
            $or: [
              { user1: { id: currentUserId } },
              { user2: { id: currentUserId } },
            ],
          },
          populate: {
            user1: true,
            user2: true,
            messages: {
              populate: { sender: true },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        });

        return { data: chats };
      } catch (err) {
        console.error('getAllUserChats error:', err);
        return ctx.internalServerError('Failed to fetch chats');
      }
    },
  }),
);

