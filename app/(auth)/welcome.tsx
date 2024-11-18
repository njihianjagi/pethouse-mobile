import React, {useState, useEffect} from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useDispatch} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import {useTheme, useTranslations, ActivityIndicator} from '../../dopebase';
import {setUserData} from '../../redux/reducers/auth';

import {useAuth} from '../../hooks/useAuth';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useConfig} from '../../config';
import {Link, useRouter} from 'expo-router';
import {View, YStack, Button, Text, Spinner, Spacer} from 'tamagui';
import {updateUser} from '../../api/firebase/users/userClient';
import TermsOfUseView from '../../components/TermsOfUseView';

const WelcomeScreen = (props) => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const dispatch = useDispatch();
  const config = useConfig();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);

  const colorSet = theme.colors[appearance];

  const [isLoading, setIsLoading] = useState(true);

  const authManager = useAuth();

  const {title, caption} = props;

  useEffect(() => {
    tryToLoginFirst();
  }, [router]);

  const handleInitialNotification = async () => {
    const userID = currentUser?.id || currentUser?.userID;
    const intialNotification = await messaging().getInitialNotification();

    if (intialNotification && Platform.OS === 'android') {
      const {
        // @ts-ignore
        data: {channelID, type},
      } = intialNotification;

      if (type === 'chat_message') {
        handleChatMessageType(channelID, currentUser.name);
      }
    }

    if (userID && Platform.OS === 'ios') {
      updateUser(userID, {badgeCount: 0});
    }
  };

  const tryToLoginFirst = async () => {
    setIsLoading(true);
    console.log('trying to login first');
    if (!authManager?.retrievePersistedAuthUser) {
      console.log('no persisted user');
      setIsLoading(false);
      return;
    }
    authManager
      ?.retrievePersistedAuthUser(config)
      .then(async (response) => {
        if (response?.user) {
          await dispatch(
            setUserData({
              user: response.user,
            })
          );
          if (Platform.OS !== 'web') {
            handleInitialNotification();
          }

          return router.push('/(onboarding)');
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const handleChatMessageType = (channelID, name) => {
    const channel = {
      id: channelID,
      channelID,
      name,
    };

    // navigation.navigate('PersonalChat', {
    //   channel,
    //   openedFromPushNotification: true,
    // })
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      <View style={styles?.logo}>
        <Image
          style={styles.logoImage}
          source={
            props.delayedMode ? theme.icons.delayedLogo : theme.icons?.logo
          }
        />
      </View>

      <YStack padding='$8' gap='$4' {...props} justifyContent='center'>
        <Text style={styles.title}>
          {title ? title : config.onboardingConfig.welcomeTitle}
        </Text>
        <Text style={styles.caption}>
          {caption ? caption : config.onboardingConfig.welcomeCaption}
        </Text>

        <Spacer size='$8' />

        {!isLoading && (
          <YStack gap='$4'>
            <Button
              theme='active'
              backgroundColor={colorSet.secondaryForeground}
              color={colorSet.primaryForeground}
              onPress={() =>
                config.isSMSAuthEnabled
                  ? router.push({
                      pathname: '/login-phone',
                      params: {isSigningUp: 'true'},
                    })
                  : router.push('/signup-email')
              }
            >
              {localized('Get Started')}
            </Button>

            <TouchableOpacity
              style={styles.alreadyHaveAnAccountContainer}
              onPress={() =>
                config.isSMSAuthEnabled
                  ? router.push({
                      pathname: '/login-phone',
                      params: {isSigningUp: 'false'},
                    })
                  : router.push('/login-email')
              }
            >
              <Text style={styles.alreadyHaveAnAccountText}>
                {localized('Already have an account? ')}
                <Text color={colorSet.primaryForeground}>Login</Text>
              </Text>
            </TouchableOpacity>
          </YStack>
        )}

        {isLoading && (
          <Spinner
            size='large'
            color={theme.colors[appearance].primaryForeground}
          />
        )}
      </YStack>
    </View>
  );
};

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorSet.primaryBackground,
    },
    logo: {
      width: 'auto',
      height: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      width: 200,
      height: 150,
      resizeMode: 'contain',
      tintColor: '',
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 0,
      marginBottom: 0,
      textAlign: 'center',
    },
    caption: {
      fontSize: 16,
      lineHeight: 24,
      paddingHorizontal: 16,

      textAlign: 'center',
      color: colorSet.primaryForeground,
    },
    loginContainer: {
      width: '70%',
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      paddingTop: 14,
      paddingBottom: 14,
      marginTop: 30,
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
    },
    loginText: {
      color: colorSet.primaryBackground,
      fontSize: 15,
      fontWeight: 'normal',
    },
    signupContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '70%',
      backgroundColor: colorSet.primaryBackground,
      borderRadius: 25,
      borderWidth: Platform.OS === 'ios' ? 0.5 : 1.0,
      borderColor: colorSet.primaryForeground,
      padding: 10,
      paddingTop: 14,
      paddingBottom: 14,
      marginTop: 20,
      alignSelf: 'center',
    },
    signupText: {
      color: colorSet.primaryForeground,
      fontSize: 14,
      fontWeight: 'normal',
    },
    dismissButton: {
      position: 'absolute',
      top: 36,
      right: 24,
    },
    alreadyHaveAnAccountContainer: {
      alignItems: 'center',
      marginTop: 8,
    },
    alreadyHaveAnAccountText: {
      color: colorSet.secondaryText,
    },
    tos: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

export default WelcomeScreen;
