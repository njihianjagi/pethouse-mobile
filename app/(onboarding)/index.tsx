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
        if (!currentUser.kennelId) {
          router.replace('/breeder');
        } else {
          console.log('user has kennel');

          router.replace('(tabs)' as Href);
        }
      } else if (currentUser.role === 'seeker') {
        console.log('seeker..');
        if (!currentUser.preferredBreeds) {
          router.replace('/seeker');
        } else {
          router.replace('(tabs)' as Href);
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
