import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import UserSelector from './UserSelector';


const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/chats');

        // Ensure the response data is an array
        if (Array.isArray(response.data)) {
          setChats(response.data);
        } else {
          setChats([]); // Fallback in case the response is not an array
          console.error("Unexpected API response:", response.data);
        }
      } catch (err) {
        setError('Failed to load chats. Please try again later.');
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  
  const handleNewChat = async (userId) => {
    try {
      setCreatingChat(true);

      const response = await axiosInstance.post(`/api/chats/user/${userId}`, {});
      navigate(`/chats/${response.data._id}`);

    } catch (err) {
      console.error("Error creating chat:", err.response?.data || err.message);
      alert(`Failed to create chat: ${err.response?.data?.msg || err.message}`);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleStartNewConversation = () => {
    setShowUserSelector(true);
  };
  
  

  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();

      // Check if date is valid
      if (isNaN(date.getTime())) return '';

      // If the chat is from today, show time instead of date
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // If within the last week, show day name
      const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }

      // Otherwise show full date
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const filteredChats = Array.isArray(chats)
    ? chats.filter(chat => {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = chat.otherUser?.username?.toLowerCase().includes(searchLower);
        const messageMatch = chat.lastMessage?.content?.toLowerCase().includes(searchLower);
        return titleMatch || messageMatch;
      })
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-lg mx-auto mt-6">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          {searchTerm && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading ? (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading chats...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <button 
            className="text-blue-500 hover:text-blue-700"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : (
        /* Chat List */
        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Link 
                to={`/chats/${chat.id}`}
                key={chat.id}
                className="block hover:bg-gray-100 transition-all"
              >
                <div className="p-4 flex items-center">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                    {chat.otherUser?.avatar ? (
                      <img src={chat.otherUser.avatar} alt={chat.otherUser.username || "Chat"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg">
                        {(chat.otherUser?.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Chat Details */}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">{chat.otherUser?.username || "Unknown User"}</h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(chat.lastActivity)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {chat.lastMessage?.content || "No messages yet"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full ml-2">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? "No conversations match your search" : "No conversations yet"}
            </div>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all flex items-center justify-center"
          onClick={handleStartNewConversation}
          disabled={creatingChat || loading}
        >
          {creatingChat ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Start New Conversation
            </>
          )}
        </button>
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <UserSelector
          onUserSelect={handleNewChat}
          onClose={() => setShowUserSelector(false)}
        />
      )}
    </div>
  );
};

export default ChatList;