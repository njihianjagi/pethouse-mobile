import { supabase } from '../client';
import { ErrorCode } from '../../../utils/ErrorCode';
import appleAuth, {
    AppleAuthRequestScope,
    AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getUnixTimeStamp } from '../../../helpers/timeFormat';

const defaultProfilePhotoURL =
    'https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg';

const validateUsernameFieldIfNeeded = (inputFields, appConfig) => {
    return new Promise((resolve, reject) => {
        const usernamePattern = /^[aA-zZ]\w{3,29}$/;

        if (!appConfig.isUsernameFieldEnabled) {
            resolve({ success: true });
        }
        if (
            appConfig.isUsernameFieldEnabled &&
            !inputFields?.hasOwnProperty('username')
        ) {
            return resolve({ error: 'Invalid username' });
        }

        if (!usernamePattern.test(inputFields.username)) {
            return resolve({ error: 'Invalid username' });
        }

        resolve({ success: true });
    });
};

const loginWithEmailAndPassword = async (email, password) => {
    try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            let errorCode = ErrorCode.serverError;
            switch (error.message) {
                case 'Invalid login credentials':
                    errorCode = ErrorCode.invalidPassword;
                    break;
                case 'User not found':
                    errorCode = ErrorCode.noUser;
                    break;
                default:
                    errorCode = ErrorCode.serverError;
            }
            return { error: errorCode };
        }

        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return { error: ErrorCode.serverError };
        }

        return { user: { ...profile, id: user.id, userID: user.id } };
    } catch (error) {
        console.error('Login error:', error);
        return { error: ErrorCode.serverError };
    }
};

const createAccountWithEmailAndPassword = async (userDetails, appConfig) => {
    try {
        const {
            email,
            firstName,
            lastName,
            username,
            password,
            phoneNumber,
            profilePictureURL,
            location,
            signUpLocation,
        } = userDetails;

        // Check if username is taken
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username?.toLowerCase())
            .single();

        if (existingUser) {
            return { error: ErrorCode.usernameInUse };
        }

        // Create auth user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            let errorCode = ErrorCode.serverError;
            if (signUpError.message.includes('already registered')) {
                errorCode = ErrorCode.emailInUse;
            }
            return { error: errorCode };
        }

        // Create user profile
        const timestamp = getUnixTimeStamp();
        const userData = {
            id: user.id,
            userID: user.id,
            email,
            first_name: firstName || '',
            last_name: lastName || '',
            username: (username || '')?.toLowerCase(),
            phone_number: phoneNumber || '',
            profile_picture_url: profilePictureURL || defaultProfilePhotoURL,
            location: location || '',
            sign_up_location: signUpLocation || '',
            app_identifier: appConfig.appIdentifier,
            created_at: new Date(timestamp * 1000).toISOString(),
        };

        const { error: profileError } = await supabase
            .from('users')
            .insert([userData]);

        if (profileError) {
            // If profile creation fails, delete the auth user
            await supabase.auth.admin.deleteUser(user.id);
            return { error: ErrorCode.serverError };
        }

        return { user: userData };
    } catch (error) {
        console.error('Sign up error:', error);
        return { error: ErrorCode.serverError };
    }
};

const retrievePersistedAuthUser = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
            return null;
        }

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            return null;
        }

        return { ...profile, id: session.user.id, userID: session.user.id };
    } catch (error) {
        console.error('Retrieve user error:', error);
        return null;
    }
};

const logout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { error: ErrorCode.serverError };
        }
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { error: ErrorCode.serverError };
    }
};

const deleteUser = async (userID) => {
    try {
        // Delete user profile
        const { error: profileError } = await supabase
            .from('users')
            .delete()
            .eq('id', userID);

        if (profileError) {
            return { success: false, error: ErrorCode.serverError };
        }

        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(userID);
        if (authError) {
            return { success: false, error: ErrorCode.requiresRecentLogin };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, error: ErrorCode.serverError };
    }
};

const authManager = {
    validateUsernameFieldIfNeeded,
    retrievePersistedAuthUser,
    loginWithEmailAndPassword,
    createAccountWithEmailAndPassword,
    logout,
    deleteUser,
};

export default authManager; 