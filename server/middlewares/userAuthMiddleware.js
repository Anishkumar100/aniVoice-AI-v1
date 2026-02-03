import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const userAuthMiddleware = async (req, res, next) => 
{
    try 
    {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) 
        {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const presentUser = await User.findById(decoded.id);
            req.user = presentUser; 
            next();
        } 
        else 
        {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
    }
    catch (error) 
    {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

export default userAuthMiddleware;