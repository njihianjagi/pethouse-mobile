import React, {useCallback, useLayoutEffect} from 'react';
import {Keyboard} from 'react-native';
import {Href, useFocusEffect, useNavigation, useRouter} from 'expo-router';
import deviceStorage from '../../utils/AuthDeviceStorage';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/reducers/auth';
import {useAuth} from '../../hooks/useAuth';
import {ThemedView} from '../../components/ThemedView';
import {useConfig} from '../../config';
import {checkUserOnboardingStage} from '../../utils/onboardingUtils';
import {authStore, checkPersistenceLoaded, debugPersistence} from '../../store';
import {observer} from '@legendapp/state/react';
import {syncState, when} from '@legendapp/state';
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
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(console.log('Persistence load timeout')), 5000)
    );

    debugPersistence();

    const state$ = syncState(authStore);
    await Promise.race([when(state$.isPersistLoaded), timeoutPromise]);

    debugPersistence();
    // Log the persistence state to debug
    console.log('Persistence loaded:', state$.isPersistLoaded.get());

    const shouldShowOnboardingFlow = authStore.shouldShowOnboardingFlow.get();

    console.log('should show onbaording: ', shouldShowOnboardingFlow);
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
