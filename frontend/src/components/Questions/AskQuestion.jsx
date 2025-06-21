import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import { AuthContext } from "../contexts/AuthContext";

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { title, body, tags } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when field is edited
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!body.trim()) {
      errors.body = "Question details are required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post('/api/questions', formData);
      navigate(`/questions/${res.data._id}`);
    } catch (err) {
      console.error("Error asking question:", err);
      setFormErrors({
        submit: err.response?.data?.msg || "Failed to submit question. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 border-l-4 border-yellow-500 bg-yellow-100 text-yellow-800 rounded-lg">
        Please log in to ask a question.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-5">Ask a Question</h2>

      {formErrors.submit && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md">
          {formErrors.submit}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block font-medium text-gray-600">
            Question Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={`w-full mt-1 p-3 border ${formErrors.title ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-blue-400`}
            value={title}
            onChange={onChange}
            placeholder="Be specific and clear"
          />
          {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="body" className="block font-medium text-gray-600">
            Question Details
          </label>
          <textarea
            id="body"
            name="body"
            rows="6"
            className={`w-full mt-1 p-3 border ${formErrors.body ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-blue-400`}
            value={body}
            onChange={onChange}
            placeholder="Include all necessary details"
          ></textarea>
          {formErrors.body && <p className="text-red-500 text-sm mt-1">{formErrors.body}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block font-medium text-gray-600">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            value={tags}
            onChange={onChange}
            placeholder="Add tags (e.g., javascript, react, node)"
          />
          <p className="text-gray-500 text-sm mt-1">Add up to 5 tags to categorize your question</p>
        </div>

        <button
          type="submit"
          className="w-full p-3 mt-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Question"}
        </button>
      </form>
    </div>
  );
};

export default AskQuestion;
