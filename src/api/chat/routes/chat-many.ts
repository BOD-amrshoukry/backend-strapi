export default {
  routes: [
    {
      method: 'GET',
      path: '/chats/user-chats',
      handler: 'chat.getUserChats',
    },
    {
      method: 'GET',
      path: '/chats/users-without-chat',
      handler: 'chat.usersWithoutChat',
    },
    {
      method: 'POST',
      path: '/chats/create',
      handler: 'chat.create',
    },
    {
      method: 'POST',
      path: '/chats/mark-all-as-read',
      handler: 'chat.markAllChatsAsRead',
    },

    {
      method: 'GET',
      path: '/chats/unread-count',
      handler: 'chat.getTotalUnreadMessages',
    },
    {
      method: 'GET',
      path: '/chats/all',
      handler: 'chat.getAllUserChats',
    },

    {
      method: 'POST',
      path: '/chats/mark-read/:chatId',
      handler: 'chat.markChatAsRead',
    },
    {
      method: 'POST',
      path: '/chats/:id/messages',
      handler: 'chat.sendMessage',
    },
    {
      method: 'GET',
      path: '/chats/:id',
      handler: 'chat.findOne',
    },
  ],
};

