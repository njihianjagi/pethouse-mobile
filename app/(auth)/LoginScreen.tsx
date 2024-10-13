import React, {useState} from 'react';
import {
  I18nManager,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { useNavigation } from '@react-navigation/core'
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
// import IMGoogleSignInButton from '../../../components/IMGoogleSignInButton/IMGoogleSignInButton'
import {useDispatch} from 'react-redux';
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
  Alert,
} from '../../dopebase';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {setUserData} from '../../redux/reducers/auth';
import {localizedErrorMessage} from '../../utils/ErrorCode';
import {useAuth} from '../../hooks/useAuth';
import {useConfig} from '../../config';
import IMGoogleSignInButton from '../../components/IMGoogleSignInButton/IMGoogleSignInButton';

const LoginScreen = () => {
  // const navigation = useNavigation()
  const authManager = useAuth();
  const dispatch = useDispatch();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const config = useConfig();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const styles = dynamicStyles(theme, appearance);

  const onPressLogin = () => {
    setLoading(true);
    authManager
      .loginWithEmailAndPassword(
        email && email.trim(),
        password && password.trim(),
        config
      )
      .then((response) => {
        if (response?.user) {
          const user = response.user;
          dispatch(setUserData({user}));
          Keyboard.dismiss();
          if (user?.role === 'admin') {
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'AdminStack', params: { user } }],
            // })
          } else {
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'MainStack', params: { user } }],
            // })
          }
        } else {
          setLoading(false);
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{text: localized('OK')}],
            {
              cancelable: false,
            }
          );
        }
      });
  };

  const onFBButtonPress = () => {
    setLoading(true);
    authManager
      .loginOrSignUpWithFacebook(config)
      .then((response) => {
        setLoading(false);
        if (response?.user) {
          const user = response.user;
          dispatch(setUserData({user}));
          Keyboard.dismiss();
          if (user?.role === 'admin') {
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'AdminStack', params: { user } }],
            // })
          } else {
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'MainStack', params: { user } }],
            // })
          }
        } else {
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{text: localized('OK')}],
            {
              cancelable: false,
            }
          );
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log('error', error);
        Alert.alert(
          '',
          localizedErrorMessage(error, localized),
          [{text: localized('OK')}],
          {
            cancelable: false,
          }
        );
      });
  };

  const onGoogleButtonPress = () => {
    setLoading(true);
    authManager
      .loginOrSignUpWithGoogle(config)
      .then((response) => {
        setLoading(false);
        if (response?.user) {
          const user = response.user;
          dispatch(setUserData({user}));
          Keyboard.dismiss();
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: 'MainStack', params: { user } }],
          // })
        } else {
          setLoading(false);
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{text: localized('OK')}],
            {
              cancelable: false,
            }
          );
        }
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert(
          '',
          localizedErrorMessage(error, localized),
          [{text: localized('OK')}],
          {
            cancelable: false,
          }
        );
      });
  };

  const onAppleButtonPress = async () => {
    setLoading(true);
    authManager.loginOrSignUpWithApple(config).then((response) => {
      if (response?.user) {
        const user = response.user;
        dispatch(setUserData({user}));
        Keyboard.dismiss();
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack', params: { user } }],
        // })
      } else {
        setLoading(false);
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{text: localized('OK')}],
          {
            cancelable: false,
          }
        );
      }
    });
  };

  const onForgotPassword = async () => {
    // navigation.push('ResetPassword', {
    //   isResetPassword: true,
    // })
  };

  const appleButtonStyle = config.isAppleAuthEnabled
    ? {
        dark: AppleButton?.Style?.WHITE,
        light: AppleButton?.Style?.BLACK,
        'no-preference': AppleButton?.Style?.WHITE,
      }
    : {};

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps='always'
      >
        <TouchableOpacity
          style={{alignSelf: 'flex-start'}}
          onPress={
            () => {}
            // () => navigation.goBack()
          }
        >
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>
        <Text style={styles.title}>{localized('Sign In')}</Text>
        <TextInput
          style={styles.InputContainer}
          placeholder={localized('E-mail')}
          keyboardType='email-address'
          placeholderTextColor='#aaaaaa'
          onChangeText={(text) => setEmail(text)}
          value={email}
          underlineColorAndroid='transparent'
          autoCapitalize='none'
        />
        <TextInput
          style={styles.InputContainer}
          placeholderTextColor='#aaaaaa'
          secureTextEntry
          placeholder={localized('Password')}
          onChangeText={(text) => setPassword(text)}
          value={password}
          underlineColorAndroid='transparent'
          autoCapitalize='none'
        />
        {config.forgotPasswordEnabled && (
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={() => onForgotPassword()}>
              <Text style={styles.forgotPasswordText}>
                {localized('Forgot password?')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.loginContainer}
          onPress={() => onPressLogin()}
        >
          <Text style={styles.loginText}>{localized('Log In')}</Text>
        </TouchableOpacity>
        {config.isFacebookAuthEnabled && (
          <>
            <Text style={styles.orTextStyle}> {localized('OR')}</Text>
            <TouchableOpacity
              style={styles.facebookContainer}
              onPress={() => onFBButtonPress()}
            >
              <Text style={styles.facebookText}>
                {localized('Login With Facebook')}
              </Text>
            </TouchableOpacity>
          </>
        )}
        {config.isGoogleAuthEnabled && (
          <IMGoogleSignInButton
            containerStyle={styles.googleButtonStyle}
            onPress={onGoogleButtonPress}
          />
        )}
        {config.isAppleAuthEnabled && appleAuth.isSupported && (
          <AppleButton
            cornerRadius={25}
            style={styles.appleButtonContainer}
            buttonStyle={appleButtonStyle[appearance]}
            buttonType={AppleButton.Type.SIGN_IN}
            onPress={() => onAppleButtonPress()}
          />
        )}
        {config.isSMSAuthEnabled && (
          <TouchableOpacity
            style={styles.phoneNumberContainer}
            onPress={
              () => {}
              //() => navigation.navigate('Sms', { isSigningUp: false })
            }
          >
            <Text style={styles.phoneNumber}>
              {localized('Login with phone number')}
            </Text>
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator />}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default LoginScreen;

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colorSet.primaryBackground,
    },
    orTextStyle: {
      color: colorSet.primaryText,
      marginTop: 40,
      marginBottom: 10,
      alignSelf: 'center',
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 25,
      marginBottom: 20,
      alignSelf: 'stretch',
      textAlign: 'left',
      marginLeft: 30,
    },
    loginContainer: {
      width: '70%',
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      marginTop: 30,
      alignSelf: 'center',
      alignItems: 'center',
    },
    loginText: {
      color: '#ffffff',
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

    facebookContainer: {
      width: '70%',
      backgroundColor: '#4267B2',
      borderRadius: 25,
      padding: 10,
      marginTop: 30,
      alignSelf: 'center',
      alignItems: 'center',
    },
    googleButtonStyle: {
      alignSelf: 'center',
      marginTop: 15,
      padding: 5,
      elevation: 0,
    },
    appleButtonContainer: {
      width: '70%',
      height: 40,
      marginTop: 16,
      alignSelf: 'center',
    },
    facebookText: {
      color: '#ffffff',
      fontSize: 14,
    },
    phoneNumberContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    phoneNumber: {
      color: colorSet.primaryText,
    },
    forgotPasswordContainer: {
      width: '80%',
      alignSelf: 'center',
      alignItems: 'flex-end',
      marginTop: 8,
    },
    forgotPasswordText: {
      fontSize: 14,
      padding: 4,
      color: colorSet.primaryText,
    },
    backArrowStyle: {
      resizeMode: 'contain',
      tintColor: colorSet.primaryForeground,
      width: 25,
      height: 25,
      marginTop: Platform.OS === 'ios' ? 50 : 20,
      marginLeft: 10,
      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
    },
  });
};
