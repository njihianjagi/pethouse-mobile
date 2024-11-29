import React, {useEffect} from 'react';
import {useRouter} from 'expo-router';
import {View, Spinner} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';

const BreederOnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    console.log('current user: ', currentUser);
    if (!currentUser) return;

    const {kennel} = currentUser;

    if (currentUser?.onboardingComplete) {
      router.replace('/(tabs)');
      return;
    }

    if (!kennel) {
      router.push('/(onboarding)/(breeder)/basic-info');
      return;
    }

    if (!kennel?.breeds || kennel.breeds.length === 0) {
      router.push('/(onboarding)/(breeder)/breeds');
      return;
    }

    if (!kennel?.facilities) {
      router.push('/(onboarding)/(breeder)/facilities');
      return;
    }

    router.push('/(onboarding)/(breeder)/basic-info');
  }, [currentUser, router]);

  return (
    <View flex={1} alignItems='center' justifyContent='center'>
      <Spinner size='large' />
    </View>
  );
};

export default BreederOnboardingScreen;
