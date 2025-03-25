import React, { useState } from 'react';
import {
  Dimensions,
  I18nManager,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardTypeOptions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
  Alert,
  ProfilePictureSelector,
} from '../../dopebase';
import { setUserData } from '../../redux/reducers/auth';
import { localizedErrorMessage } from '../../utils/ErrorCode';
import TermsOfUseView from '../../components/TermsOfUseView';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../config';
import { Button, Input, ScrollView, YStack } from 'tamagui';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface InputField {
  key: string;
  placeholder: string;
  secureTextEntry?: boolean;
  type?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

interface UserDetails {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureURL?: string;
  location?: string;
  signUpLocation?: string;
  photoFile?: any;
  appIdentifier?: string;
}

interface ProfilePictureFile {
  uri: string;
  type: string;
  name: string;
}

const SignupScreen = () => {
  const router = useRouter();
  const authManager = useAuth();
  const dispatch = useDispatch();

  const config = useConfig();
  const { localized } = useTranslations();
  const { theme, appearance } = useTheme();
  const colorSet = theme.colors[appearance];

  const styles = dynamicStyles(theme, appearance);

  const [inputFields, setInputFields] = useState<UserDetails>({});
  const [profilePictureFile, setProfilePictureFile] = useState<ProfilePictureFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const validateEmail = (text: string): boolean => {
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(String(text).toLowerCase());
  };

  const validatePassword = (text: string): boolean => {
    let reg = /^(?=.*[A-Z])(?=.*[a-z])/;
    return reg.test(String(text));
  };

  const trimFields = (fields: UserDetails): UserDetails => {
    const trimmedFields: UserDetails = {};
    Object.keys(fields).forEach((key) => {
      if (key === 'photoFile') {
        trimmedFields.photoFile = fields.photoFile;
      } else if (fields[key as keyof UserDetails]) {
        trimmedFields[key as keyof UserDetails] = fields[key as keyof UserDetails]?.toString().trim();
      }
    });
    return trimmedFields;
  };

  const onChangeInputFields = (text: string, key: keyof UserDetails) => {
    setInputFields((prevFields) => ({
      ...prevFields,
      [key]: text,
    }));
  };

  const renderInputField = (field: InputField, index: number) => {
    return (
      <Input
        key={index?.toString()}
        style={styles.InputContainer}
        placeholder={field.placeholder}
        placeholderTextColor='#aaaaaa'
        secureTextEntry={field.secureTextEntry}
        onChangeText={(text) => onChangeInputFields(text, field.key as keyof UserDetails)}
        value={inputFields[field.key as keyof UserDetails]?.toString()}
        keyboardType={field.type}
        underlineColorAndroid='transparent'
        autoCapitalize={field.autoCapitalize}
      />
    );
  };

  const renderSignupWithEmail = () => {
    return (
      <>
        {config.signupFields.map(renderInputField)}
        <TouchableOpacity style={styles.signupContainer} onPress={onRegister}>
          <Text style={styles.signupText}>{localized('Sign Up')}</Text>
        </TouchableOpacity>
      </>
    );
  };

  const onRegister = async () => {
    const { error: usernameError } =
      await authManager.validateUsernameFieldIfNeeded(inputFields, config);
    if (usernameError) {
      Alert.alert('', localized(usernameError), [{ text: localized('OK') }], {
        cancelable: false,
      });
      setInputFields((prevFields) => ({
        ...prevFields,
        password: '',
      }));
      return;
    }

    if (!validateEmail(inputFields?.email?.trim() || '')) {
      Alert.alert(
        '',
        localized('Please enter a valid email address.'),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        }
      );
      return;
    }

    if (!inputFields?.password?.trim()) {
      Alert.alert(
        '',
        localized('Password cannot be empty.'),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        }
      );
      setInputFields((prevFields) => ({
        ...prevFields,
        password: '',
      }));
      return;
    }

    if (inputFields?.password?.trim()?.length < 6) {
      Alert.alert(
        '',
        localized(
          'Password is too short. Please use at least 6 characters for security reasons.'
        ),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        }
      );
      setInputFields((prevFields) => ({
        ...prevFields,
        password: '',
      }));
      return;
    }

    setLoading(true);

    const userDetails = {
      ...trimFields(inputFields),
      photoFile: profilePictureFile,
      appIdentifier: config.appIdentifier,
    };

    if (userDetails.username) {
      userDetails.username = userDetails.username.toLowerCase();
    }

    authManager
      .createAccountWithEmailAndPassword(userDetails, config)
      .then((response) => {
        const user = response.user;
        if (user) {
          dispatch(setUserData({ user }));
          Keyboard.dismiss();
          router.replace('/(tabs)');
        } else {
          setLoading(false);
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{ text: localized('OK') }],
            {
              cancelable: false,
            }
          );
        }
      });
  };

  const onFBButtonPress = () => {
    setLoading(true);
    authManager.loginOrSignUpWithFacebook(config).then((response) => {
      if (response?.user) {
        const user = response.user;
        dispatch(setUserData({ user }));
        Keyboard.dismiss();
        router.replace('/(tabs)');
      } else {
        setLoading(false);
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          }
        );
      }
    });
  };

  const onGoogleButtonPress = () => {
    setLoading(true);
    authManager.loginOrSignUpWithGoogle(config).then((response) => {
      if (response?.user) {
        const user = response.user;
        dispatch(setUserData({ user }));
        Keyboard.dismiss();
        router.replace('/(onboarding)');
      } else {
        setLoading(false);
        setError(true);
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          }
        );
      }
    });
  };

  const onAppleButtonPress = async () => {
    setLoading(true);
    const response = await authManager.loginOrSignUpWithApple(config);
    if (response?.user) {
      const user = response.user;
      dispatch(setUserData({ user }));
      Keyboard.dismiss();
      router.replace('/(onboarding)');
    } else {
      setLoading(false);
      setError(true);
      Alert.alert(
        '',
        localizedErrorMessage(response.error, localized),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps='always'
      >
        <TouchableOpacity
          onPress={
            () => { }
            //() => navigation.goBack()
          }
        >
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>
        <Text style={styles.title}>{localized('Create new account')}</Text>
        <ProfilePictureSelector setProfilePictureFile={setProfilePictureFile} />

        <Button
          theme='active'
          backgroundColor={colorSet.secondaryForeground}
          color={colorSet.primaryForeground}
          onPress={onRegister}
          disabled={loading}
        >
          {localized('Continue with email')}
        </Button>

        <Button
          onPress={onAppleButtonPress}
          disabled={loading}
          style={styles.socialButton}
        >
          <FontAwesome name="apple" size={24} color={colorSet.primaryText} />
          <Text style={styles.socialButtonText}>
            {localized('Continue with Apple')}
          </Text>
        </Button>

        <Button
          onPress={onGoogleButtonPress}
          disabled={loading}
          style={styles.socialButton}
        >
          <FontAwesome name="google" size={24} color={colorSet.primaryText} />
          <Text style={styles.socialButtonText}>
            {localized('Continue with Google')}
          </Text>
        </Button>

        <Button
          onPress={onFBButtonPress}
          disabled={loading}
          style={styles.socialButton}
        >
          <FontAwesome name="facebook" size={24} color={colorSet.primaryText} />
          <Text style={styles.socialButtonText}>
            {localized('Continue with Facebook')}
          </Text>
        </Button>

        <TermsOfUseView
          tosLink={config.tosLink}
          privacyPolicyLink={config.privacyPolicyLink}
          style={styles.tos}
        />
        {config.isSMSAuthEnabled && (
          <>
            <Text style={styles.orTextStyle}>{localized('OR')}</Text>
            <TouchableOpacity
              style={styles.PhoneNumberContainer}
              onPress={
                () => { }
                //</> () => navigation.navigate('Sms', { isSigningUp: true })
              }
            >
              <Text>{localized('Sign up with phone number')}</Text>
            </TouchableOpacity>
          </>
        )}
        <TermsOfUseView
          tosLink={config.tosLink}
          privacyPolicyLink={config.privacyPolicyLink}
          style={styles.tos}
        />
      </ScrollView>
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default SignupScreen;

const { height } = Dimensions.get('window');
const imageSize = height * 0.232;
const photoIconSize = imageSize * 0.27;

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorSet.primaryBackground,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 25,
      marginBottom: 30,
      alignSelf: 'stretch',
      textAlign: 'left',
      marginLeft: 35,
    },

    content: {
      paddingLeft: 50,
      paddingRight: 50,
      textAlign: 'center',
      fontSize: 20,
      color: colorSet.primaryForeground,
    },
    loginContainer: {
      width: '65%',
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      marginTop: 30,
    },
    loginText: {
      color: colorSet.primaryBackground,
    },
    placeholder: {
      color: 'red',
    },
    InputContainer: {
      height: 42,
      borderWidth: 1,
      borderColor: colorSet.grey3,
      backgroundColor: colorSet.primaryBackground,
      paddingLeft: 20,
      color: colorSet.primaryText,
      width: '80%',
      alignSelf: 'center',
      marginTop: 20,
      alignItems: 'center',
      borderRadius: 25,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
    },

    signupContainer: {
      alignSelf: 'center',
      alignItems: 'center',
      width: '65%',
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      marginTop: 50,
    },
    signupText: {
      color: colorSet.primaryBackground,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageBlock: {
      flex: 2,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageContainer: {
      height: imageSize,
      width: imageSize,
      borderRadius: imageSize,
      shadowColor: '#006',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      overflow: 'hidden',
    },
    formContainer: {
      width: '100%',
      flex: 4,
      alignItems: 'center',
    },
    photo: {
      marginTop: imageSize * 0.77,
      marginLeft: -imageSize * 0.29,
      width: photoIconSize,
      height: photoIconSize,
      borderRadius: photoIconSize,
    },

    addButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#d9d9d9',
      opacity: 0.8,
      zIndex: 2,
    },
    orTextStyle: {
      marginTop: 20,
      marginBottom: 10,
      alignSelf: 'center',
      color: colorSet.primaryText,
    },
    PhoneNumberContainer: {
      marginTop: 10,
      marginBottom: 10,
      alignSelf: 'center',
    },
    smsText: {
      color: '#4267b2',
    },
    tos: {
      marginTop: 40,
      alignItems: 'center',
      justifyContent: 'center',
      height: 30,
    },
    backArrowStyle: {
      resizeMode: 'contain',
      tintColor: colorSet.primaryForeground,
      width: 25,
      height: 25,
      marginTop: Platform.OS === 'ios' ? 50 : 20,
      marginLeft: 10,
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
    socialButton: {
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      marginTop: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    socialButtonText: {
      color: colorSet.primaryBackground,
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    orText: {
      marginTop: 20,
      marginBottom: 10,
      alignSelf: 'center',
      color: colorSet.primaryText,
    },
  });
};
