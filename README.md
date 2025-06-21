# Q&A Chat Platform 💬

A full-stack web application that combines Q&A functionality with real-time chat messaging. Built with React, Node.js, Express, MongoDB, and Socket.IO.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes and middleware
- Secure password hashing with bcrypt

### ❓ Q&A System
- Ask and answer questions
- Upvote/downvote questions
- Comment on questions
- Tag-based categorization
- User profiles and reputation

### 💬 Real-time Chat
- One-on-one messaging
- Real-time message delivery with Socket.IO
- Message persistence
- User selection for new conversations
- Chat history and timestamps

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean and intuitive interface
- Loading states and error handling
- Optimistic UI updates

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qa-chat-platform.git
   cd qa-chat-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   JWT_SECRET=your_jwt_secret_here
   CLIENT_URL=http://localhost:5173
   PORT=5002
   ```
   
   Create `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5002
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Run the application**
   
   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   
   Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5002

## 📁 Project Structure

```
qa-chat-platform/
├── backend/
│   ├── controller/          # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (for chat)

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `PUT /api/questions/upvote/:id` - Upvote question
- `PUT /api/questions/downvote/:id` - Downvote question

### Comments
- `GET /api/comments/question/:questionId` - Get comments for question
- `POST /api/comments` - Add comment
- `PUT /api/comments/:id` - Update comment

### Chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:id` - Get specific chat
- `POST /api/chats/user/:userId` - Create/get chat with user
- `POST /api/chats/:id/messages` - Send message

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Subham Garg**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Inspired by platforms like Stack Overflow and Discord
