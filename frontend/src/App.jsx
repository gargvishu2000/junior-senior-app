import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './components/HomePage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import QuestionList from './components/Questions/QuestionList';
import QuestionDetail from './components/Questions/QuestionDetail';
import AskQuestion from './components/Questions/AskQuestion';
import ChatList from './components/Chat/ChatList';
import ChatRoom from './components/Chat/ChatRoom';
import { AuthProvider } from './components/contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/questions" element={<QuestionList />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />

                {/* Wrap private routes inside PrivateRoute */}
                <Route element={<PrivateRoute />}>
                  <Route path="/ask-question" element={<AskQuestion />} />
                  <Route path="/chats" element={<ChatList />} />
                  <Route path="/chats/:id" element={<ChatRoom />} />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
