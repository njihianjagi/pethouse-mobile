import {useRouter} from 'expo-router';

export const checkUserOnboardingStage = (user: any) => {
  const router = useRouter();

  if (user.role) {
    // Redirect to the appropriate profile creation screen based on the role
    if (user.role === 'breeder') {
      console.log('going to breeder profile');
      router.replace('(onboarding)/BreederProfileScreen');
    } else if (user.role === 'seeker') {
      console.log('going to seeker profile');
      router.replace('(onboarding)/SeekerProfileScreen');
    }
  } else {
    console.log('going to role selection');
    router.replace('(onboarding)/RoleSelectionScreen');
  }
};
