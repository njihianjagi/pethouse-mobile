import crudManager from '../crud/supabaseCrudManager';
import { ErrorCode } from '../../../utils/ErrorCode';
import { supabase } from '../client';

const TABLE_NAME = 'onboarding_profiles';

const createOnboardingProfile = async (profileData: any) => {
    return crudManager.create(TABLE_NAME, profileData);
};

const getOnboardingProfile = async (userId: string) => {
    return crudManager.read(TABLE_NAME, userId);
};

const updateOnboardingProfile = async (userId: string, profileData: any) => {
    return crudManager.update(TABLE_NAME, userId, profileData);
};

const deleteOnboardingProfile = async (userId: string) => {
    return crudManager.remove(TABLE_NAME, userId);
};

const getOnboardingStep = async (userId: string, step: string) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`step_${step}`)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Get onboarding step error:', error);
            return { error: ErrorCode.serverError };
        }

        return { data: data[`step_${step}`] };
    } catch (error) {
        console.error('Get onboarding step error:', error);
        return { error: ErrorCode.serverError };
    }
};

const updateOnboardingStep = async (userId: string, step: string, stepData: any) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update({ [`step_${step}`]: stepData })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update onboarding step error:', error);
            return { error: ErrorCode.serverError };
        }

        return { data };
    } catch (error) {
        console.error('Update onboarding step error:', error);
        return { error: ErrorCode.serverError };
    }
};

const onboardingCrudManager = {
    createOnboardingProfile,
    getOnboardingProfile,
    updateOnboardingProfile,
    deleteOnboardingProfile,
    getOnboardingStep,
    updateOnboardingStep,
};

export default onboardingCrudManager; 