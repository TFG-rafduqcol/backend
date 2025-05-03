const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {

    const token = req.header('Authorization')?.split(' ')[1];     
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
    // Check if the token is valid and extract user information
        
        const userId = decoded.id; 
        const isAdmin = decoded.isAdmin;
        req.isAdmin = isAdmin;
        req.userId = userId;
        
        next(); 
    });
};

module.exports = authenticateToken;
