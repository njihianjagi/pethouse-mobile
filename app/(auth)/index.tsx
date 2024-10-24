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

const LoadScreen = () => {
  // const navigation = useNavigation()
  const router = useRouter();

  const dispatch = useDispatch();
  const authManager = useAuth();

  const config = useConfig();

  useFocusEffect(
    useCallback(() => {
      setAppState();
    }, [])
  );

  const setAppState = async () => {
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
    console.log('fetching..');
    if (!authManager?.retrievePersistedAuthUser) {
      console.log('goign to welcome');
      return router.push('/welcome');
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

  return <ThemedView />;
};

export default LoadScreen;
