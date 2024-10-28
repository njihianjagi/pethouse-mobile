import {useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import {Href, useRouter} from 'expo-router';
import useCurrentUser from '../../hooks/useCurrentUser';
import {Spinner} from 'tamagui';
import {useTheme} from '../../dopebase';

export default function OnboardingModal() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {theme, appearance} = useTheme();

  useEffect(() => {
    checkUserOnboardingStage();
  }, [currentUser]);

  const checkUserOnboardingStage = () => {
    if (currentUser.role) {
      if (currentUser.role === 'breeder') {
        if (!currentUser.userBreeds) {
          router.replace('/breeder');
        } else {
          router.replace('/(tabs)');
        }
      } else if (currentUser.role === 'seeker') {
        console.log('seeker..');
        if (!currentUser.preferredBreeds) {
          router.replace('/seeker');
        } else {
          router.replace('/(tabs)');
        }
      }
    } else {
      console.log('no role');
      router.replace('/RoleSelectionScreen');
    }
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Spinner
        size='large'
        color={theme.colors[appearance].primaryForeground}
      />
    </View>
  );
}
