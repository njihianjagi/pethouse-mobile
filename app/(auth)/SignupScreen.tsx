import React, {useState} from 'react';
import {
  Dimensions,
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
  Alert,
  ProfilePictureSelector,
} from '../../dopebase';
import {setUserData} from '../../redux/auth';
import {localizedErrorMessage} from '../../utils/ErrorCode';
import TermsOfUseView from '../../components/TermsOfUseView';
import {useAuth} from '../../hooks/useAuth';
import {useConfig} from '../../config';

const SignupScreen = () => {
  // const navigation = useNavigation()
  const authManager = useAuth();
  const dispatch = useDispatch();

  const config = useConfig();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);

  const [inputFields, setInputFields] = useState({} as any);

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (text) => {
    let reg =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(String(text).toLowerCase()) ? true : false;
  };

  const validatePassword = (text) => {
    let reg = /^(?=.*[A-Z])(?=.*[a-z])/;
    return reg.test(String(text)) ? true : false;
  };

  const trimFields = (fields) => {
    var trimmedFields = {};
    Object.keys(fields).forEach((key) => {
      if (fields[key]) {
        trimmedFields[key] = fields[key].trim();
      }
    });
    return trimmedFields;
  };

  const onRegister = async () => {
    const {error: usernameError} =
      await authManager.validateUsernameFieldIfNeeded(inputFields, config);
    if (usernameError) {
      Alert.alert('', localized(usernameError), [{text: localized('OK')}], {
        cancelable: false,
      });
      setInputFields((prevFields) => ({
        ...prevFields,
        password: '',
      }));
      return;
    }

    if (!validateEmail(inputFields?.email?.trim())) {
      Alert.alert(
        '',
        localized('Please enter a valid email address.'),
        [{text: localized('OK')}],
        {
          cancelable: false,
        }
      );
      return;
    }

    if (inputFields?.password?.trim() == '') {
      Alert.alert(
        '',
        localized('Password cannot be empty.'),
        [{text: localized('OK')}],
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
        [{text: localized('OK')}],
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
    } as any;
    if (userDetails.username) {
      userDetails.username = userDetails.username?.toLowerCase();
    }

    authManager
      .createAccountWithEmailAndPassword(userDetails, config)
      .then((response) => {
        const user = response.user;
        if (user) {
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

  const onChangeInputFields = (text, key) => {
    setInputFields((prevFields) => ({
      ...prevFields,
      [key]: text,
    }));
  };

  const renderInputField = (field, index) => {
    return (
      <TextInput
        key={index?.toString()}
        style={styles.InputContainer}
        placeholder={field.placeholder}
        placeholderTextColor='#aaaaaa'
        secureTextEntry={field.secureTextEntry}
        onChangeText={(text) => onChangeInputFields(text, field.key)}
        value={inputFields[field.key]}
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

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps='always'
      >
        <TouchableOpacity
          onPress={
            () => {}
            //() => navigation.goBack()
          }
        >
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>
        <Text style={styles.title}>{localized('Create new account')}</Text>
        <ProfilePictureSelector setProfilePictureFile={setProfilePictureFile} />

        {renderSignupWithEmail()}

        {config.isSMSAuthEnabled && (
          <>
            <Text style={styles.orTextStyle}>{localized('OR')}</Text>
            <TouchableOpacity
              style={styles.PhoneNumberContainer}
              onPress={
                () => {}
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
      </KeyboardAwareScrollView>
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default SignupScreen;

const {height} = Dimensions.get('window');
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
      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
    },
  });
};
