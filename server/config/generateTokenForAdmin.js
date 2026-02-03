// server/config/generateTokenForAdmin.js
import jwt from 'jsonwebtoken';

const generateTokenForAdmin = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_ADMIN, {
        expiresIn: '30d',
    });
};

export default generateTokenForAdmin;