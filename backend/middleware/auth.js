import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  // Get token from cookies or headers
  let token = req.cookies.authToken;

  // If no cookie token, check Authorization header
  if (!token) {
    const authHeader = req.header('Authorization') || req.header('x-auth-token');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
