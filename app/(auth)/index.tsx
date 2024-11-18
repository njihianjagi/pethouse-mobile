import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import {useFocusEffect, useRouter} from 'expo-router';
import deviceStorage from '../../utils/AuthDeviceStorage';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/reducers/auth';
import {useAuth} from '../../hooks/useAuth';
import {useConfig} from '../../config';
import {observer} from '@legendapp/state/react';
import {Spinner, View} from 'tamagui';
import {useTheme} from '../../dopebase';

const LoadScreen = observer(() => {
  // const navigation = useNavigation()
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  const dispatch = useDispatch();
  const authManager = useAuth();

  const config = useConfig();

  useFocusEffect(
    useCallback(() => {
      setAppState();
    }, [])
  );

  const setAppState = async () => {
    // Add timeout to prevent infinite waiting
    const shouldShowOnboardingFlow =
      await deviceStorage.getShouldShowOnboardingFlow();

    if (!shouldShowOnboardingFlow) {
      if (config?.isDelayedLoginEnabled) {
        fetchPersistedUserIfNeeded();
        return;
      }
      router.push('/delayed-login');
    } else {
      router.push('/walkthrough');
    }
  };

  const fetchPersistedUserIfNeeded = async () => {
    if (!authManager?.retrievePersistedAuthUser) {
      return router.replace('/welcome');
    }
    authManager
      ?.retrievePersistedAuthUser(config)
      .then((response) => {
        if (response?.user) {
          dispatch(
            setUserData({
              user: response.user,
            })
          );
          Keyboard.dismiss();
          console.log('goign to onboarding');

          return router.replace('/(onboarding)');
        }
      })
      .catch((error) => {
        console.log(error);
        return router.push('/welcome');
      });
  };

  return (
    <View flex={1} justifyContent='center' alignItems='center'>
      <Spinner size='large' color={colorSet.primaryForeground} />
    </View>
  );
});

export default LoadScreen;
