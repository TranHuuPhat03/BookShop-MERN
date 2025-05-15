const jwt = require('jsonwebtoken');
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET_KEY || 'admin-secret-key'

const verifyAdminToken =  (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    // console.log(token)

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided' });
    }
    jwt.verify(token, ADMIN_JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }
        
        // Add check for admin role
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Not an admin user' });
        }
        
        req.user = user;
        next();
    })

}

module.exports = verifyAdminToken;