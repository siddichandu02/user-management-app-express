import { Request, Response } from 'express';
import userService from '../services/user.service';
import jwt from 'jsonwebtoken';
import settings from '../config/settings';

interface AuthenticatedRequest extends Request {
    user?: { id: number; username: string };
}

const signup = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.createUser(req.body);
    res.json(result);
};

const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userService.authenticateUser(req.body);
        if (user) {
            const token = jwt.sign({ id: user.id, username: user.username }, settings.JWT_SECRET);
            res.json({ token, user });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error signing in' });
    }
};

const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const user = await userService.getUserProfile(req.user.id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const result = await userService.updateUser(req.user.id, req.body);
    res.json(result);
};

const deleteProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        await userService.deleteUser(req.user.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        // Cast `error` to `Error` to access `message`
        const errorMessage = (error as Error).message;
        console.info(errorMessage);
        res.status(404).json({ message: errorMessage });
    }
};


export default { signup, signin, getProfile, updateProfile, deleteProfile };
