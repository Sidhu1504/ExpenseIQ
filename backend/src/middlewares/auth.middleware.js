const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Expecting header: "Authorization: Bearer <token>"
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user payload (id, role) to the request
        next(); // Pass to the next function
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};
