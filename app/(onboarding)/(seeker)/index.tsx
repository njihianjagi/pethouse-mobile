import React, {useEffect} from 'react';
import {useRouter} from 'expo-router';
import {View, Spinner} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';

const SeekerOnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    const {seeker} = currentUser;

    if (seeker?.onboardingComplete) {
      router.replace('/(tabs)');
      return;
    }

    if (!seeker?.household) {
      router.replace('/(onboarding)/(seeker)/household');
      return;
    }

    if (!seeker?.housing) {
      router.replace('/(onboarding)/(seeker)/housing');
      return;
    }

    if (!seeker?.experience) {
      router.replace('/(onboarding)/(seeker)/experience');
      return;
    }

    if (!seeker?.preferences) {
      router.replace('/(onboarding)/(seeker)/preferences');
      return;
    }

    router.replace('/(onboarding)/(seeker)/household');
  }, [currentUser, router]);

  return (
    <View flex={1} alignItems='center' justifyContent='center'>
      <Spinner size='large' />
    </View>
  );
};

export default SeekerOnboardingScreen;
