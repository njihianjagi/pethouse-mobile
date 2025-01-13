import React, {useEffect} from 'react';
import {useRouter} from 'expo-router';
import {View, Spinner} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useTheme} from '../../../dopebase';
import {authManager} from '../../../api/firebase/auth';

const BreederOnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  useEffect(() => {
    console.log('current user: ', currentUser);
    if (!currentUser) {
      router.replace('/(auth)/welcome');
      return;
    }
    const {kennel, breeding} = currentUser;

    console.log(kennel);
    if (currentUser?.onboardingComplete) {
      router.replace('/(tabs)');
      return;
    }

    if (!kennel) {
      router.push('/(onboarding)/(breeder)/basic-info');
      return;
    }

    if (!breeding || breeding.breeds.length === 0) {
      router.push('/(onboarding)/(breeder)/breeds');
      return;
    }

    if (!breeding.facilities) {
      router.push('/(onboarding)/(breeder)/facilities');
      return;
    }

    router.push('/(onboarding)/(breeder)/basic-info');
  }, [currentUser, router]);

  return (
    <View flex={1} alignItems='center' justifyContent='center'>
      <Spinner size='large' color={colorSet.primaryForeground} />
    </View>
  );
};

export default BreederOnboardingScreen;
