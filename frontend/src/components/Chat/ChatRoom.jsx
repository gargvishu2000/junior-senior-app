import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import { AuthContext } from "../contexts/AuthContext";

const ChatRoom = () => {
  const { id: chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const currentUserId = currentUser?.id;

  useEffect(() => {
    const fetchChatAndMessages = async () => {
      try {
        setLoading(true);
        console.log('Fetching chat with ID:', chatId);

        const chatRes = await axiosInstance.get(`/api/chats/${chatId}`);
        console.log('Chat response:', chatRes.data);
        console.log('Messages from backend:', chatRes.data.messages);

        setChat(chatRes.data);
        setMessages(chatRes.data.messages || []);
        console.log('Messages set in state:', chatRes.data.messages || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError("Failed to load chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (chatId) fetchChatAndMessages();
  }, [chatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage("");

    try {
      // Create a temporary message object for immediate UI feedback
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: { _id: currentUserId, username: currentUser?.username },
        content: messageContent,
        timestamp: new Date(),
        read: false,
        status: 'sending'
      };

      // Add to messages immediately for better UX
      setMessages((prev) => [...prev, tempMessage]);

      // Send message to backend
      const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, {
        content: messageContent
      });

      console.log('Message sent successfully:', response.data);

      // Replace temporary message with the real one from backend
      setMessages((prev) =>
        prev.map(msg =>
          msg._id === tempMessage._id ? response.data : msg
        )
      );

    } catch (err) {
      console.error("Error sending message:", err);

      // Mark the temporary message as failed
      setMessages((prev) =>
        prev.map(msg =>
          msg._id.startsWith('temp-') ? { ...msg, status: 'failed' } : msg
        )
      );

      // Don't restore the message text - let user retry if needed
    } finally {
      setSending(false);
    }
  };

  const handleRetryMessage = async (messageId) => {
    // Find the failed message
    const failedMessage = messages.find(msg => (msg._id || msg.id) === messageId && msg.status === "failed");
    if (!failedMessage) return;

    // Update message status to sending
    setMessages(prev =>
      prev.map(msg => (msg._id || msg.id) === messageId ? { ...msg, status: "sending" } : msg)
    );

    try {
      const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, {
        content: failedMessage.content
      });

      // Update message with server response
      setMessages(prev =>
        prev.map(msg => (msg._id || msg.id) === messageId ? response.data : msg)
      );
    } catch (err) {
      console.error("Error resending message:", err);
      // Keep the failed status
      setMessages(prev =>
        prev.map(msg => (msg._id || msg.id) === messageId ? { ...msg, status: "failed" } : msg)
      );
    }
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get other participant for header display
  const getOtherParticipant = () => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(p => p._id !== currentUserId);
  };

  const otherParticipant = getOtherParticipant();

  if (loading) return (
    <div className="flex justify-center items-center p-6 h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Loading chat...</span>
    </div>
  );
  
  if (error) return (
    <div className="p-6 text-center h-screen flex flex-col items-center justify-center">
      <div className="text-red-500 mb-3">{error}</div>
      <div className="flex space-x-4">
        <button 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => navigate("/chats")}
        >
          Back to Chats
        </button>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  if (!chat) return (
    <div className="p-6 text-center h-screen flex flex-col items-center justify-center">
      <div className="text-gray-700 mb-3">Chat not found</div>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => navigate("/chats")}
      >
        Back to Chats
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white rounded-lg shadow overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b flex items-center">
        <Link to="/chats" className="mr-2 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
          {otherParticipant?.avatar ? (
            <img src={otherParticipant.avatar} alt={otherParticipant.username} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-bold">
              {otherParticipant?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium">{otherParticipant?.username || 'Chat'}</h3>
          <p className="text-sm text-gray-500">
            Click to view profile
          </p>
        </div>
        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => {
              // Handle both backend format (sender._id) and temp format (sender.id)
              const senderId = message.sender?._id || message.sender?.id || message.senderId;
              const isCurrentUser = senderId === currentUserId;
              const messageId = message._id || message.id;
              const timestamp = message.timestamp || message.createdAt;

              return (
                <div key={messageId} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"
                    } ${message.status === "failed" ? "opacity-70" : ""}`}
                  >
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 flex justify-between items-center ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                      <span>{formatTime(timestamp)}</span>
                      {message.status === "sending" && (
                        <span className="ml-2 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse mr-1"></div>
                          Sending
                        </span>
                      )}
                      {message.status === "failed" && (
                        <button
                          onClick={() => handleRetryMessage(messageId)}
                          className="ml-2 text-red-300 hover:text-white flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-l-lg border border-r-0 border-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border-y px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-r-lg transition-colors flex items-center justify-center ${
              newMessage.trim() && !sending
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;