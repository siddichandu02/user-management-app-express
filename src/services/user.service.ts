import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface UserData {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
interface AuthData {
    username: string;
    password: string;
}

const createUser = async ({ username, email, password, firstName, lastName }: UserData) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { username, email, password: hashedPassword, firstName, lastName }
    });
};

interface UserWithPassword {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface AuthData {
    username: string;
    password: string;
}

interface UserWithPassword {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export const authenticateUser = async ({ username, password }: AuthData): Promise<Omit<UserWithPassword, 'password'> | null> => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            email: true,
            password: true,  // Include password for internal verification
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true
        }
    }) as UserWithPassword | null;

    if (user && await bcrypt.compare(password, user.password)) {
        // Remove the password from the user object before returning
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    return null;
};
export const getUserProfile = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true
            // Do not include password here
        }
    });
};
const updateUser = async (id: number, data: Partial<UserData>) => {
    return prisma.user.update({
        where: { id },
        data
    });
};
const deleteUser = async (id: number) => {
    // Check if the user exists
    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new Error(`User with ID ${id} does not exist`);
    }

    // Delete the user if they exist
    return prisma.user.delete({
        where: { id }
    });
};

export default { createUser, authenticateUser, getUserProfile, updateUser, deleteUser };
