import React, {useState, useEffect, useRef, forwardRef} from 'react';
import {
  Image,
  Keyboard,
  TouchableOpacity,
  Dimensions,
  I18nManager,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {useTheme, useTranslations, Alert} from '../../dopebase';
import {setUserData} from '../../redux/reducers/auth';
import {useDispatch} from 'react-redux';
import {localizedErrorMessage} from '../../utils/ErrorCode';
import TermsOfUseView from '../../components/TermsOfUseView';
import {useAuth} from '../../hooks/useAuth';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useConfig} from '../../config';
import {
  Text,
  View,
  Button,
  YStack,
  Sheet,
  Spinner,
  Input,
  styled,
  ScrollView,
} from 'tamagui';
import {ChevronDown} from '@tamagui/lucide-icons';
import {CountryCode, parsePhoneNumber} from 'libphonenumber-js';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SmsAuthenticationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    isSigningUp,
    isConfirmSignUpCode,
    isConfirmResetPasswordCode,
    email,
    userInfo,
  } = params;

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const authManager = useAuth();
  const dispatch = useDispatch();

  const styles = dynamicStyles(theme, appearance);
  const config = useConfig();

  const colorSet = theme.colors[appearance];

  const [inputFields, setInputFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countriesPickerData, setCountriesPickerData] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryCode, setCountryCode] = useState('KE' as any); // Default country code

  const phoneRef = useRef(null as any); // Create a ref for the phone input

  const codeInputCellCount = 6;

  const StyledInput = styled(Input, {
    height: 48,
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 9,
    backgroundColor: colorSet.primaryBackground,
    borderColor: colorSet.grey3,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  });

  const myCodeInput = useBlurOnFulfill({
    //codeInputValue,
    value: codeInputValue,
    cellCount: codeInputCellCount,
  });
  const [codeInputProps, getCellOnLayoutHandler] = useClearByFocusCell({
    // @ts-ignore
    codeInputValue,
    value: codeInputValue,
    setCodeInputValue,
    setValue: setCodeInputValue,
  });

  useEffect(() => {
    if (codeInputValue?.trim()?.length === codeInputCellCount) {
      onFinishCheckingCode(codeInputValue);
    }
  }, [codeInputValue]);

  useEffect(() => {
    if (phoneRef && phoneRef.current) {
      setPhoneNumber('+254 ');
    }
  }, [phoneRef]);

  const onFBButtonPress = () => {
    setLoading(true);
    authManager.loginOrSignUpWithFacebook(config).then((response) => {
      if (response?.user) {
        const user = response.user;
        dispatch(setUserData({user}));
        Keyboard.dismiss();
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack', params: { user } }],
        // })
        router.replace('/(tabs)');
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

  const onGoogleButtonPress = () => {
    setLoading(true);
    authManager.loginOrSignUpWithGoogle(config).then((response) => {
      if (response?.user) {
        const user = response.user;
        dispatch(setUserData({user}));
        Keyboard.dismiss();
        router.replace('/(onboarding)');
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
        router.replace('/(tabs)');
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

  const signInWithPhoneNumber = (userValidPhoneNumber) => {
    setLoading(true);

    authManager.sendSMSToPhoneNumber(userValidPhoneNumber).then((response) => {
      setLoading(false);
      const confirmationResult = response.confirmationResult;
      if (confirmationResult) {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        // @ts-ignore
        window['confirmationResult'] = confirmationResult;
        setVerificationId(confirmationResult.verificationId);
        setIsCodeInputVisible(true);
        //setOpen(true);
        //showToast()
      } else {
        // Error; SMS not sent
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{text: localized('OK')}],
          {cancelable: false}
        );
      }
    });
  };

  // const showToast = () => {
  //   toast.show(`Code sent to your phone.`, {
  //     message: "Enter the code below to verify.",
  //   })
  // };

  const trimFields = (fields) => {
    var trimmedFields = {};
    Object.keys(fields).forEach((key) => {
      if (fields[key]) {
        trimmedFields[key] = fields[key].trim();
      }
    });
    return trimmedFields;
  };

  const signUpWithPhoneNumber = (smsCode) => {
    const userDetails = {
      ...trimFields(inputFields),
      phoneNumber: phoneNumber,
      photoFile: profilePictureFile,
    };
    authManager
      .registerWithPhoneNumber(
        userDetails,
        smsCode,
        verificationId,
        config.appIdentifier
      )
      .then((response) => {
        setLoading(false);
        if (response.error) {
          console.log(response.error);
          showAlert(localizedErrorMessage(response.error, localized));

          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{text: localized('OK')}],
            {cancelable: false}
          );
        } else {
          console.log(
            'register resp: ',
            JSON.stringify(response.user, null, 1)
          );
          const user = response.user;
          dispatch(setUserData({user}));
          Keyboard.dismiss();
          router.replace('/(onboarding)');
        }
      });
  };

  const isValidNumber = (phoneNumber: string, countryCode: string) => {
    try {
      const parsedNumber = parsePhoneNumber(
        phoneNumber,
        countryCode as CountryCode
      );
      return parsedNumber.isValid();
    } catch (error) {
      return false;
    }
  };

  const onPressSend = async () => {
    if (isValidNumber(phoneNumber, countryCode)) {
      setLoading(true);
      if (isSigningUp === 'true') {
        const {error} = await authManager.validateUsernameFieldIfNeeded(
          trimFields(inputFields),
          config
        );

        if (error) {
          Alert.alert(
            '',
            localized(error),
            [{text: localized('OK'), onPress: () => setLoading(false)}],
            {
              cancelable: false,
            }
          );
          return;
        }
      }

      signInWithPhoneNumber(phoneNumber);
    } else {
      Alert.alert(
        '',
        localized('Please enter a valid phone number.'),
        [{text: localized('OK')}],
        {
          cancelable: false,
        }
      );
    }
  };

  const onPressFlag = () => {
    setSheetOpen(true);
  };

  const onPressCancelContryModalPicker = () => {
    setCountryModalVisible(false);
  };

  const onFinishCheckingCode = (newCode) => {
    setIsCodeInputVisible(false);
    setLoading(true);

    if (isSigningUp === 'true') {
      signUpWithPhoneNumber(newCode);
      return;
    }

    if (isSigningUp === 'false') {
      authManager.loginWithSMSCode(newCode, verificationId).then((response) => {
        if (response.error) {
          setIsCodeInputVisible(true);
          setLoading(false);
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{text: localized('OK')}],
            {cancelable: false}
          );

          router.push({
            pathname: '/(auth)/login-phone',
            params: {isSigningUp: 'true'},
          });
        } else {
          console.log('login res:', JSON.stringify(response.user));
          const user = response.user;
          dispatch(setUserData({user}));
          Keyboard.dismiss();
          router.replace('/(onboarding)');
        }
      });
    }
  };

  const onChangeInputFields = (text, key) => {
    setInputFields((prevFields) => ({
      ...prevFields,
      [key]: text,
    }));
  };

  const renderCodeInputCell = ({index, symbol, isFocused}) => {
    let textChild = symbol;

    if (isFocused) {
      textChild = <Cursor />;
    }

    return (
      <Text
        key={index}
        style={[styles.codeInputCell, isFocused && styles.focusCell]}
        onLayout={getCellOnLayoutHandler(index)}
      >
        {textChild}
      </Text>
    );
  };

  const renderCodeInput = () => {
    return (
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={isCodeInputVisible}
        snapPoints={[50]}
        dismissOnSnapToBottom
        zIndex={100_000}
        animation='medium'
      >
        <Sheet.Overlay
          animation='lazy'
          enterStyle={{opacity: 0}}
          exitStyle={{opacity: 0}}
        />
        <Sheet.Handle />

        <Sheet.Frame
          padding='$4'
          justifyContent='center'
          alignItems='center'
          gap='$5'
          backgroundColor={colorSet.primaryBackground}
        >
          <Text color={colorSet.primaryForeground} fontSize='$4'>
            Enter code sent to {phoneNumber}{' '}
          </Text>

          <CodeField
            ref={myCodeInput}
            {...codeInputProps}
            value={codeInputValue}
            onChangeText={setCodeInputValue}
            cellCount={codeInputCellCount}
            keyboardType='number-pad'
            textContentType='oneTimeCode'
            renderCell={renderCodeInputCell}
            autoFocus
          />

          <TouchableOpacity onPress={onPressSend}>
            <Text color={colorSet.secondaryText}>
              {localized("Didn't get a code? ")}
              <Text color={colorSet.primaryForeground}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </Sheet.Frame>
      </Sheet>
    );
  };

  const renderAsSignUpState = () => {
    return (
      <YStack gap='$8'>
        <YStack>
          <Text style={styles.title}>
            {localized("Let's create your account")}
          </Text>

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

        <YStack gap='$4'>
          {!isConfirmSignUpCode &&
            config.smsSignupFields.map((field, index) => (
              <Input
                key={index?.toString()}
                style={styles.InputContainer}
                placeholder={field.placeholder}
                placeholderTextColor='#aaaaaa'
                onChangeText={(text) => onChangeInputFields(text, field.key)}
                value={inputFields[field.key]}
                underlineColorAndroid='transparent'
              />
            ))}

          <Input
            ref={phoneRef}
            style={styles.InputContainer}
            placeholder={localized('Phone number')}
            placeholderTextColor={colorSet.grey3}
            keyboardType='numeric'
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
          />

          <Button
            theme='active'
            backgroundColor={colorSet.secondaryForeground}
            color={colorSet.primaryForeground}
            onPress={onPressSend}
            iconAfter={loading ? <Spinner /> : <></>}
            disabled={loading}
          >
            {!loading && localized('Continue with phone')}
          </Button>

          {isCodeInputVisible && renderCodeInput()}

          {isConfirmSignUpCode && (
            <Text style={styles.orTextStyle}>
              {localized('Please check your phone for a confirmation code.')}
            </Text>
          )}

          {config.isGoogleAuthEnabled && (
            <YStack gap='$4'>
              <Text style={styles.orTextStyle}> {localized('OR')}</Text>
              <Button
                icon={
                  <FontAwesome
                    name='google'
                    size={24}
                    color={colorSet.primaryForeground}
                  />
                }
                themeShallow
                color={colorSet.primaryForeground}
                onPress={onGoogleButtonPress}
                iconAfter={loading ? <Spinner /> : <></>}
                disabled={loading}
              >
                Sign up with Google
              </Button>
            </YStack>
          )}

          {config.isFacebookAuthEnabled && (
            <Button
              icon={
                <FontAwesome
                  name='facebook'
                  size={24}
                  color={colorSet.primaryForeground}
                />
              }
              color={colorSet.primaryForeground}
              themeInverse
              onPress={onFBButtonPress}
            >
              Login with Facebook
            </Button>
          )}

          <TermsOfUseView
            tosLink={config.tosLink}
            privacyPolicyLink={config.privacyPolicyLink}
            style={styles.tos}
          />
        </YStack>
      </YStack>
    );
  };

  const renderAsLoginState = () => {
    return (
      <YStack gap='$8'>
        {isConfirmResetPasswordCode ? (
          <Text style={styles.title}>{localized('Reset Password')}</Text>
        ) : (
          <YStack gap='$2' marginBottom='$4'>
            <Text style={styles.title}>{localized(' Login to continue')}</Text>
            {/* 
            // <Text style={styles.caption}>
            //   {localized('Login to your account')}
            // </Text> */}

            <TouchableOpacity
              style={styles.alreadyHaveAnAccountContainer}
              onPress={() =>
                config.isSMSAuthEnabled
                  ? router.push({
                      pathname: '/login-phone',
                      params: {isSigningUp: 'true'},
                    })
                  : router.push('/signup-email')
              }
            >
              <Text style={styles.alreadyHaveAnAccountText}>
                {localized("Don't have an account? ")}
                <Text color={colorSet.primaryForeground}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </YStack>
        )}

        <YStack gap='$4'>
          <Input
            ref={phoneRef}
            style={styles.InputContainer}
            placeholder={localized('Phone number')}
            placeholderTextColor={colorSet.grey3}
            keyboardType='numeric'
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            autoFocus
          />

          <Button
            theme='active'
            backgroundColor={colorSet.secondaryForeground}
            color={colorSet.primaryForeground}
            onPress={onPressSend}
            iconAfter={loading ? <Spinner /> : <></>}
            disabled={loading}
          >
            {!loading && localized('Continue with phone')}
          </Button>

          {isCodeInputVisible && renderCodeInput()}

          {isConfirmResetPasswordCode && (
            <Text style={styles.orTextStyle}>
              {localized('Please check your e-mail for a confirmation code.')}
            </Text>
          )}

          {config.isGoogleAuthEnabled && (
            <YStack gap='$4'>
              <Text style={styles.orTextStyle}> {localized('OR')}</Text>
              <Button
                icon={
                  <FontAwesome
                    name='google'
                    size={24}
                    color={colorSet.primaryForeground}
                  />
                }
                themeShallow
                color={colorSet.primaryForeground}
                onPress={onGoogleButtonPress}
              >
                Login with Google
              </Button>
            </YStack>
          )}

          {config.isFacebookAuthEnabled && (
            <Button
              icon={
                <FontAwesome
                  name='facebook'
                  size={24}
                  color={colorSet.primaryForeground}
                />
              }
              color={colorSet.primaryForeground}
              themeInverse
              onPress={onFBButtonPress}
            >
              Login with Facebook
            </Button>
          )}
        </YStack>
      </YStack>
    );
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colorSet.primaryBackground,
      }}
    >
      <YStack gap='$2' alignItems='center' paddingHorizontal='$4'>
        <YStack gap='$2'>
          <View style={styles?.logo}>
            <Image style={styles.logoImage} source={theme.icons?.logo} />
          </View>
        </YStack>

        {isSigningUp === 'true' && renderAsSignUpState()}

        {isSigningUp === 'false' && renderAsLoginState()}
      </YStack>
    </ScrollView>
  );
};

export default SmsAuthenticationScreen;

// const CurrentToast = () => {
//   const currentToast: any = useToastState()

//   if (!currentToast) return null

//   return (
//     <Toast
//       key={'121212'}
//       duration={currentToast.duration}
//       enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
//       exitStyle={{ opacity: 0, scale: 1, y: -20 }}
//       y={0}
//       opacity={1}
//       scale={1}
//       animation="100ms"
//       viewportName={currentToast.viewportName}
//     >
//       <YStack>
//         <Toast.Title>{currentToast.title}</Toast.Title>
//         {!!currentToast.message && (
//           <Toast.Description>{currentToast.message}</Toast.Description>
//         )}
//       </YStack>
//     </Toast>
//   )

// }

const width = Dimensions.get('window').width;
const codeInptCellWidth = width * 0.13;

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
      fontSize: 40,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 0,
      alignSelf: 'stretch',
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    caption: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: colorSet.grey6,
    },
    sendContainer: {
      width: '70%',
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      marginTop: 30,
      alignSelf: 'center',
      alignItems: 'center',
    },
    sendText: {
      color: '#ffffff',
    },
    InputContainer: {
      // height: 48,
      // borderWidth: 1,
      // borderColor: colorSet.grey3,
      // backgroundColor: colorSet.primaryBackground,
      // color: colorSet.primaryText,
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    },

    flagStyle: {
      width: 35,
      height: 25,
      borderColor: colorSet.secondaryForeground,
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0,
      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
    },
    phoneInputTextStyle: {
      borderLeftWidth: I18nManager.isRTL ? 0 : 1,
      borderRightWidth: I18nManager.isRTL ? 1 : 0,
      borderColor: colorSet.grey3,
      height: 42,
      fontSize: 15,
      color: colorSet.primaryText,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      borderBottomRightRadius: I18nManager.isRTL ? 0 : 25,
      borderTopRightRadius: I18nManager.isRTL ? 0 : 25,
      borderBottomLeftRadius: I18nManager.isRTL ? 25 : 0,
      borderTopLeftRadius: I18nManager.isRTL ? 25 : 0,
      paddingLeft: 10,
    },
    input: {
      flex: 1,
      borderLeftWidth: 1,
      borderRadius: 3,
      borderColor: colorSet.grey3,
      color: colorSet.primaryText,
      fontSize: 24,
      fontWeight: '700',
      backgroundColor: colorSet.primaryBackground,
    },
    // code input style
    root: {
      padding: 20,
      minHeight: 300,
      alignItems: 'center',
    },
    codeFieldContainer: {
      //marginTop: 20,
      alignItems: 'center',
    },
    codeInputCell: {
      width: codeInptCellWidth,
      height: 60,
      lineHeight: 55,
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'center',
      marginLeft: 8,
      borderRadius: 6,
      backgroundColor: colorSet.grey3,
    },
    focusCell: {
      borderColor: '#000',
    },
    orTextStyle: {
      alignSelf: 'center',
      color: colorSet.primaryText,
    },
    facebookContainer: {
      width: '70%',
      backgroundColor: '#4267b2',
      borderRadius: 25,
      marginTop: 30,
      alignSelf: 'center',
      alignItems: 'center',
      padding: 10,
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
    signWithEmailContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    signWithEmailText: {
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
