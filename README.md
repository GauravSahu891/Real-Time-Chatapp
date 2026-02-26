# 💬 MERN Real-Time Chat App

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io.

---

## 🚀 Features

- 🔐 User Authentication (Signup / Login / Logout)
- 🔑 JWT Authentication with HTTP-only Cookies
- 💬 Real-Time Messaging (Socket.io)
- 🖼️ Image Sharing in Chat
- 👤 User Profile with Profile Picture Upload
- 🟢 Online/Offline User Status
- 🌙 Modern Responsive UI
- 🔔 Toast Notifications
- 🔒 Protected Routes

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Zustand (State Management)
- Axios
- Socket.io Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- JWT
- Bcrypt
- cloudinary

### Setup .env file

Create a `.env` file in the `backend` folder (see `backend/.env.example`). Example:

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=development

# Email verification (Resend)
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=https://real-time-chatapp-1-vyz7.onrender.com
```

### Build the app

```shell
npm run build
```

### Start the app

```shell
npm start
```
