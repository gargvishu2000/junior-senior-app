import React from "react";
import { Link } from "react-router-dom";
import { FiHelpCircle, FiMessageCircle, FiUsers } from "react-icons/fi";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-primary-700 to-secondary-700 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to Q&A Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Ask questions, get answers, and connect with other users through our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/questions" className="btn bg-white text-primary-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg">
              Browse Questions
            </Link>
            <Link to="/ask-question" className="btn bg-primary-600 text-white hover:bg-primary-700 font-semibold px-6 py-3 rounded-lg">
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <FiHelpCircle className="text-primary-500 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Ask Questions</h3>
            <p className="text-gray-600">
              Post your questions and get answers from our community of experts.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <FiMessageCircle className="text-primary-500 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Get Answers</h3>
            <p className="text-gray-600">
              Receive detailed answers and engage in discussions to solve your problems.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <FiUsers className="text-primary-500 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Connect</h3>
            <p className="text-gray-600">
              Connect with other users through our chat feature for more in-depth discussions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
