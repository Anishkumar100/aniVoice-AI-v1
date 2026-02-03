import jwt from 'jsonwebtoken';

const adminAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            
            // USE THE ADMIN SECRET HERE
            const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
            
            if (decoded) {
                req.admin = decoded; // Label it as 'admin' to be clear
                next();
            }
        } else {
            return res.status(401).json({ message: "No admin token provided" });
        }
    } catch (error) {
        console.error("Admin token verification failed:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid admin token" });
    }
}

export default adminAuthMiddleware;