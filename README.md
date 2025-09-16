# Strapi Backend for Ticketing System

This repository contains the **Strapi backend** for the ticketing system dashboard. It is fully customized to support the frontend features including tickets, users, authentication, notifications, chat, and payments.

**Repository URL:** [https://github.com/BOD-amrshoukry/backend-strapi](https://github.com/BOD-amrshoukry/backend-strapi)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Custom Collections**: Tailored to store users, tickets, plans, notifications, and payments.
- **Custom Controllers & Endpoints**: Customized controllers and API endpoints to match frontend requirements.
- **Authentication & Permissions**: Uses **users-permissions plugin** for role-based access control (employee, manager, owner).
- **Email Functionality**: Integrated **email plugin** for password reset, notifications, and other automated emails.
- **Real-Time Chat**: Implemented **Socket.IO** for user-to-user chat.
- **Push Notifications**: Prepared **VAPID keys** for web push notifications.
- **Fully Extensible**: Easily add new features or collections as needed.

---

## Tech Stack

- **Backend**: Strapi (Node.js)
- **Database**: SQLite / PostgreSQL / MySQL (configurable)
- **Authentication**: Strapi Users-Permissions plugin
- **Email**: Strapi Email plugin
- **Real-Time**: Socket.IO
- **Push Notifications**: Web Push with VAPID keys
- **API**: REST endpoints (customized for frontend integration)

---

## Folder Structure

```
backend/
├── api/
│   ├── tickets/          # Custom ticket collection and controllers
│   ├── users/            # Custom user collection and controllers
│   ├── plans/            # Plans collection for payment features
│   ├── notifications/    # Notifications collection and controllers
├── config/               # Strapi configuration files
├── extensions/           # Plugins customizations (users-permissions, email, etc.)
├── sockets/              # Socket.IO setup and events
├── package.json          # Project metadata and dependencies
└── strapi-app/           # Main Strapi application files
```

Each collection has its own **controllers, services, and routes**, ensuring the backend is fully aligned with frontend needs.

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/BOD-amrshoukry/backend-strapi.git
cd backend-strapi
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the Strapi server**

```bash
npm run develop
```

The backend will be available at `http://localhost:1337/admin` for admin access.

---

## Usage

- **Admin Panel**: Manage collections, permissions, roles, and settings via Strapi Admin UI.
- **API Endpoints**: Access tickets, users, notifications, plans, and chat via customized REST endpoints.
- **Authentication**: Register, login, reset passwords, and manage roles with Users-Permissions plugin.
- **Emails**: Automated emails for password reset, notifications, and other user actions.
- **Real-Time Chat**: Communicate with other users in real-time using Socket.IO.
- **Push Notifications**: Send web push notifications using VAPID keys.

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/my-feature`)  
3. Make your changes  
4. Commit changes (`git commit -m "Add my feature"`)  
5. Push to the branch (`git push origin feature/my-feature`)  
6. Open a Pull Request

Ensure new controllers, routes, or collections are documented for frontend integration.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.