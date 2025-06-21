import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";
import CommentList from "../Comments/CommentList";
import { FaRegThumbsUp, FaThumbsDown, FaEdit, FaTrash, FaComments } from "react-icons/fa";

const QuestionDetail = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/questions/${id}`);
        setQuestion(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching question:", err);
        setError("Failed to load question. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleVote = async (type) => {
    if (!currentUser) return;

    try {
      const res = await axios.put(`${API_URL}/api/questions/${type}/${id}`);
      setQuestion({
        ...question,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes,
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold p-4 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center text-yellow-600 font-semibold p-4 bg-yellow-100 rounded-md">
        Question not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Question Header */}
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={`/avatars/${question.author.avatar}`}
          alt={question.author.username}
          className="rounded-full w-10 h-10"
        />
        <div>
          <h5 className="text-lg font-semibold">{question.author.username}</h5>
          <p className="text-gray-500 text-sm">
            Asked on {new Date(question.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Question Title & Body */}
      <h2 className="text-2xl font-bold text-gray-900">{question.title}</h2>
      <p className="text-gray-700 mt-2">{question.body}</p>

      {/* Voting System */}
      <div className="flex items-center space-x-6 mt-4">
        <button
          className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
            currentUser && question.upvotes.includes(currentUser.id)
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white"
          }`}
          onClick={() => handleVote("upvote")}
          disabled={!currentUser}
        >
          <FaRegThumbsUp /> <span>{question.upvotes.length}</span>
        </button>

        <button
          className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
            currentUser && question.downvotes.includes(currentUser.id)
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white"
          }`}
          onClick={() => handleVote("downvote")}
          disabled={!currentUser}
        >
          <FaThumbsDown /> <span>{question.downvotes.length}</span>
        </button>
      </div>

      {/* Tags */}
      {question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((tag, index) => (
            <span key={index} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {currentUser && (
        <div className="mt-6 flex space-x-4">
          {question.author._id === currentUser.id ? (
            <>
              <Link
                to={`/edit-question/${question._id}`}
                className="flex items-center space-x-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                <FaEdit /> <span>Edit</span>
              </Link>
              <button className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                <FaTrash /> <span>Delete</span>
              </button>
            </>
          ) : (
            <Link
              to={`/chats/user/${question.author._id}`}
              className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <FaComments /> <span>Chat with {question.author.username}</span>
            </Link>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <h4 className="text-xl font-semibold">Comments</h4>
        <CommentList questionId={id} />
      </div>
    </div>
  );
};

export default QuestionDetail;
