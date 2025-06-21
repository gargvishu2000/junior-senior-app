import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";

const CommentList = ({ questionId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/comments/question/${questionId}`);
        setComments(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [questionId]);

  // Delete comment function
  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`);
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center my-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  // No comments state
  if (comments.length === 0) {
    return <p>No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="mb-4">
      {comments.map((comment) => (
        <div key={comment._id} className="card mb-2">
          <div className="card-body py-2 px-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              {/* User Info */}
              <div className="d-flex align-items-center">
                <img
                  src={`/avatars/${comment.author.avatar}`}
                  alt={comment.author.username}
                  className="rounded-circle me-2"
                  width="25"
                  height="25"
                />
                <small className="text-muted">
                  {comment.author.username} • {new Date(comment.createdAt).toLocaleDateString()}
                </small>
              </div>

              {/* Delete Button (only for comment author) */}
              {currentUser && comment.author._id === currentUser.id && (
                <button className="btn btn-sm text-danger" onClick={() => handleDeleteComment(comment._id)}>
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>

            {/* Comment Body */}
            <p className="card-text mb-0">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
