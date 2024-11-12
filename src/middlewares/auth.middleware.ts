interface JwtPayload {
    id: number;
    username: string;
}
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import settings from '../config/settings';

interface AuthenticatedRequest extends Request {
    user?: { id: number; username: string };
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, settings.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }

            // Type assertion to tell TypeScript that `decoded` is of type `JwtPayload`
            const payload = decoded as JwtPayload;
            req.user = { id: payload.id, username: payload.username }; // Assign decoded payload to `req.user`
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export default authMiddleware;
