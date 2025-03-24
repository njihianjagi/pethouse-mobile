import crudManager from '../crud/supabaseCrudManager';
import { ErrorCode } from '../../../utils/ErrorCode';
import { supabase } from '../client';

const TABLE_NAME = 'users';

const createUser = async (userData: any) => {
    return crudManager.create(TABLE_NAME, userData);
};

const getUser = async (userId: string) => {
    return crudManager.read(TABLE_NAME, userId);
};

const updateUser = async (userId: string, userData: any) => {
    return crudManager.update(TABLE_NAME, userId, userData);
};

const deleteUser = async (userId: string) => {
    return crudManager.remove(TABLE_NAME, userId);
};

const getUserByUsername = async (username: string) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('username', username.toLowerCase())
            .single();

        if (error) {
            console.error('Get user by username error:', error);
            return { error: ErrorCode.serverError };
        }

        return { data };
    } catch (error) {
        console.error('Get user by username error:', error);
        return { error: ErrorCode.serverError };
    }
};

const getUserByEmail = async (email: string) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Get user by email error:', error);
            return { error: ErrorCode.serverError };
        }

        return { data };
    } catch (error) {
        console.error('Get user by email error:', error);
        return { error: ErrorCode.serverError };
    }
};

const updateUserProfile = async (userId: string, profileData: any) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(profileData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update user profile error:', error);
            return { error: ErrorCode.serverError };
        }

        return { data };
    } catch (error) {
        console.error('Update user profile error:', error);
        return { error: ErrorCode.serverError };
    }
};

const userCrudManager = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getUserByUsername,
    getUserByEmail,
    updateUserProfile,
};

export default userCrudManager; 