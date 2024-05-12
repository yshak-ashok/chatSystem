const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.status(401).json({ error: 'Token Error' });
        const parsedToken=JSON.parse(token)
        jwt.verify(parsedToken, process.env.TOKEN_SECRET_KEY, (err, user) => {
            if (err) {
                console.log(err.message);
                return res.status(403).json({ error: 'Token Error' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Error in authentication middleware:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = authenticateToken;
