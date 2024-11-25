import React, {useEffect} from 'react';
import {useRouter} from 'expo-router';
import {View, Spinner} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';

const BreederOnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    const {breeding} = currentUser;

    if (breeding?.onboardingComplete) {
      router.replace('/(tabs)');
      return;
    }

    if (!breeding?.basicInfo) {
      router.push('/(onboarding)/(breeder)/basic-info');
      return;
    }

    if (!breeding?.breeds || breeding.breeds.length === 0) {
      router.push('/(onboarding)/(breeder)/breeds');
      return;
    }

    if (!breeding?.facilities) {
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
