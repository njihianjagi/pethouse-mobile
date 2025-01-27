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
    if (!currentUser) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (currentUser?.profileComplete) {
      router.replace('/(tabs)');
      return;
    }

    // Simplified onboarding checks
    if (!currentUser.kennel?.name) {
      router.push('/(onboarding)/(breeder)/basic-info');
      return;
    }

    if (!currentUser.kennel?.primaryBreeds?.length) {
      router.push('/(onboarding)/(breeder)/breeds');
      return;
    }

    if (!currentUser.images || currentUser.images.length === 0) {
      router.push('/(onboarding)/(breeder)/image-upload');
      return;
    }

    // If all checks pass, mark onboarding as complete
    router.push('/(tabs)');
  }, [currentUser, router]);

  return (
    <View flex={1} alignItems='center' justifyContent='center'>
      <Spinner size='large' color={colorSet.primaryForeground} />
    </View>
  );
};

export default BreederOnboardingScreen;
