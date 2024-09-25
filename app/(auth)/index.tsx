import React, {useCallback, useLayoutEffect} from 'react';
import {Keyboard} from 'react-native';
import {useFocusEffect, useNavigation, useRouter} from 'expo-router';
import deviceStorage from '../../utils/AuthDeviceStorage';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/auth';
import {useAuth} from '../../hooks/useAuth';
import {ThemedView} from '../../components/ThemedView';
import {useConfig} from '../../config';
import {checkUserOnboardingStage} from '../../utils/onboardingUtils';

const LoadScreen = () => {
  // const navigation = useNavigation()
  const router = useRouter();

  const dispatch = useDispatch();
  const authManager = useAuth();
  const navigation = useNavigation();

  const config = useConfig();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
      router.push('/DelayedLoginScreen');
    } else {
      router.push('/WalkthroughScreen');
    }
  };

  const fetchPersistedUserIfNeeded = async () => {
    if (!authManager?.retrievePersistedAuthUser) {
      router.push('/WelcomeScreen');
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

          checkUserOnboardingStage(response.user);
        }
      })
      .catch((error) => {
        console.log(error);
        router.push('/WelcomeScreen');
      });
  };

  return <ThemedView />;
};

export default LoadScreen;
