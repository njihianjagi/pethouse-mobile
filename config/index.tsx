import React, {useContext} from 'react';
import {Platform} from 'react-native';
import {useTranslations} from '../dopebase';

const regexForNames = /^[a-zA-Z]{2,25}$/;

export const ConfigContext = React.createContext({} as any);

export const ConfigProvider = ({children}) => {
  const {localized} = useTranslations();
  const config = {
    isDelayedLoginEnabled: false,
    isSMSAuthEnabled: true,
    isGoogleAuthEnabled: true,
    isFacebookAuthEnabled: false,
    isAppleAuthEnabled: false,
    forgotPasswordEnabled: true,
    appIdentifier: 'com.doghouse.ke',
    facebookIdentifier: '285315185217069',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    onboardingConfig: {
      welcomeTitle: localized('Your home for quality breeds'),
      welcomeCaption: localized(
        'Discover your ideal furry companion and start a journey of love and companionship'
      ),
      walkthroughScreens: [
        {
          icon: require('../assets/icons/firebase-icon.png'),
          title: localized('Firebase'),
          description: localized(
            'Save weeks of hard work by using our codebase.'
          ),
        },
        {
          icon: require('../assets/icons/login-icon.png'),
          title: localized('Authentication & Registration'),
          description: localized(
            'Fully integrated login and sign up flows backed by Firebase.'
          ),
        },
        {
          icon: require('../assets/icons/sms-icon.png'),
          title: localized('SMS Authentication'),
          description: localized(
            'End-to-end SMS OTP verification for your users.'
          ),
        },
        {
          icon: require('../assets/icons/country-picker-icon.png'),
          title: localized('Country Picker'),
          description: localized('Country picker for phone numbers.'),
        },
        {
          icon: require('../assets/icons/reset-password-icon.png'),
          title: localized('Reset Password'),
          description: localized(
            'Fully coded ability to reset password via e-mail.'
          ),
        },
        {
          icon: require('../assets/images/instagram.png'),
          title: localized('Profile Photo Upload'),
          description: localized(
            'Ability to upload profile photos to Firebase Storage.'
          ),
        },
        {
          icon: require('../assets/images/pin.png'),
          title: localized('Geolocation'),
          description: localized(
            'Automatically store user location to Firestore via Geolocation API.'
          ),
        },
        {
          icon: require('../assets/images/notification.png'),
          title: localized('Notifications'),
          description: localized(
            'Automatically update and store push notification tokens into Firestore.'
          ),
        },
      ],
    },
    tosLink: 'https://www.doghouse.co.ke/terms-of-service/',
    privacyPolicyLink: 'https://www.doghouse.co.ke/privacy-policy/',
    isUsernameFieldEnabled: false,
    smsSignupFields: [
      // {
      //   displayName: localized('First Name'),
      //   type: 'ascii-capable',
      //   editable: true,
      //   regex: regexForNames,
      //   key: 'firstName',
      //   placeholder: 'First Name',
      // },
      // {
      //   displayName: localized('Last Name'),
      //   type: 'ascii-capable',
      //   editable: true,
      //   regex: regexForNames,
      //   key: 'lastName',
      //   placeholder: 'Last Name',
      // },
      {
        displayName: localized('Username'),
        type: 'default',
        editable: true,
        regex: regexForNames,
        key: 'username',
        placeholder: 'Username',
        autoCapitalize: 'none',
      },
    ],
    signupFields: [
      {
        displayName: localized('First Name'),
        type: 'ascii-capable',
        editable: true,
        regex: regexForNames,
        key: 'firstName',
        placeholder: 'First Name',
      },
      {
        displayName: localized('Last Name'),
        type: 'ascii-capable',
        editable: true,
        regex: regexForNames,
        key: 'lastName',
        placeholder: 'Last Name',
      },
      {
        displayName: localized('Username'),
        type: 'default',
        editable: true,
        regex: regexForNames,
        key: 'username',
        placeholder: 'Username',
        autoCapitalize: 'none',
      },
      {
        displayName: localized('E-mail Address'),
        type: 'email-address',
        editable: true,
        regex: regexForNames,
        key: 'email',
        placeholder: 'E-mail Address',
        autoCapitalize: 'none',
      },
      {
        displayName: localized('Password'),
        type: 'default',
        secureTextEntry: true,
        editable: true,
        regex: regexForNames,
        key: 'password',
        placeholder: 'Password',
        autoCapitalize: 'none',
      },
    ],
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
