import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-dark text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-primary-400 mr-2">Q&A</span> Platform
        </Link>

        {/* Nav Links - Desktop */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link to="/" className="hover:text-primary-300 transition-colors">Home</Link>
          <Link to="/questions" className="hover:text-primary-300 transition-colors">Questions</Link>

          {currentUser && (
            <>
              <Link to="/ask-question" className="hover:text-primary-300 transition-colors">Ask Question</Link>
              <Link to="/chats" className="hover:text-primary-300 transition-colors">Chats</Link>
            </>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center">
              <div className="hidden md:block mr-4">
                <span className="text-sm text-gray-300">Hello, </span>
                <span className="font-medium">{currentUser.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-outline text-white border-gray-600 hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn btn-outline text-white border-gray-600 hover:bg-gray-700">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white focus:outline-none"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-800 px-4 py-3">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/questions" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Questions</Link>
            {currentUser && (
              <>
                <Link to="/ask-question" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Ask Question</Link>
                <Link to="/chats" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Chats</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
