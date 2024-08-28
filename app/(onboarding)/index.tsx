import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import useCurrentUser from '../../hooks/useCurrentUser';
import { View } from 'tamagui';

const OnboardingScreen = () => {
	const router = useRouter();
	const currentUser = useCurrentUser();
	const authManager = useAuth();

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  useFocusEffect(
    useCallback(() => {
      checkUserRole()
    }, [currentUser, router]),
  )

  
  const checkUserRole = async () => {
    if (currentUser) {
      // Check if the user has a role
      if (currentUser.role) {
        // Redirect to the appropriate profile creation screen based on the role
        if (currentUser.role === 'breeder') {
          router.push('/BreederProfileScreen');
        } else if (currentUser.role === 'seeker') {
          router.push('/SeekerProfileScreen');
        }
      } else {
        // If no role is assigned, navigate to the role selection screen
        router.push('/RoleSelectionScreen');
      }
    } else {
      // If no user is logged in, you might want to redirect to the login screen
      router.push('/WelcomeScreen');
    }
  };

	return <View />
};

export default OnboardingScreen;