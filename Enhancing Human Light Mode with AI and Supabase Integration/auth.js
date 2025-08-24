const supabase = require('./supabaseClient');

// Middleware to verify JWT token from Supabase
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Missing or invalid authorization header' 
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ 
                error: 'Invalid or expired token' 
            });
        }

        // Attach user information to request object
        req.user = user;
        req.userId = user.id;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            error: 'Internal server error during authentication' 
        });
    }
};

// Optional middleware for routes that work with or without authentication
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (!error && user) {
                req.user = user;
                req.userId = user.id;
            }
        }
        
        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        // Continue without authentication
        next();
    }
};

module.exports = {
    authenticateUser,
    optionalAuth
};

