// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ msg: 'Invalid ID format' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ msg: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ msg: errors.join(', ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ msg: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ msg: 'Token expired' });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    msg: err.message || 'Server Error'
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  // Only handle API routes with 404, let other routes pass through
  if (req.originalUrl.startsWith('/api/')) {
    const error = new Error(`API endpoint not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  } else {
    // For non-API routes, send a simple 404 response
    res.status(404).json({
      error: 'Not Found',
      message: `The requested resource ${req.originalUrl} was not found on this server.`,
      suggestion: 'This is an API server. Please check the API documentation for available endpoints.'
    });
  }
};
