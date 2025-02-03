import React, {useEffect} from 'react';
import {useRouter} from 'expo-router';
import {View, Spinner, Text} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';
import authManager from '../../../api/firebase/auth/firebaseAuthManager';

const SeekerOnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      return router.replace('/(auth)/welcome');
    }

    if (currentUser?.onboardingComplete) {
      router.replace('/(tabs)');
      return;
    }

    if (!currentUser.preferredBreeds?.length) {
      router.replace('/(onboarding)/(seeker)/breeds');
      return;
    }

    if (!currentUser.experience) {
      router.replace('/(onboarding)/(seeker)/experience');
      return;
    }

    if (!currentUser.housing) {
      router.replace('/(onboarding)/(seeker)/housing');
      return;
    }

    // If we have all data but onboarding is not complete, go to preferences
    router.replace('/(onboarding)/(seeker)/breeds');
  }, [currentUser, router]);

  return (
    <View flex={1} alignItems='center' justifyContent='center'>
      <Text>Seeker Onboarding</Text>
      <Spinner size='large' />
    </View>
  );
};

export default SeekerOnboardingScreen;
