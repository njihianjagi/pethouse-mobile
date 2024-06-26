import React, { useState, useEffect, useRef } from 'react'
import {
  Image,
  Keyboard,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  I18nManager,
  Platform,
  StyleSheet
} from 'react-native'
import PhoneInput from 'react-native-phone-input'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'
// import { useNavigation, useRoute } from '@react-navigation/core'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication'
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
  Alert,
  ProfilePictureSelector,
  CountriesModalPicker,
} from '../../dopebase'
import { setUserData } from '../../redux/auth'
import { useDispatch } from 'react-redux'
import { localizedErrorMessage } from '../../api/ErrorCode'
import TermsOfUseView from '../../components/TermsOfUseView'
import IMGoogleSignInButton from '../../components/IMGoogleSignInButton/IMGoogleSignInButton'
import { useAuth } from '../../hooks/useAuth'
import { router, useLocalSearchParams, useRouter } from 'expo-router'
import { useConfig } from '../../config'
import { Text as TamaguiText, View as TamaguiView, XStack, Button as TamaguiButton, YStack, Sheet } from 'tamagui'
import { Toast, ToastViewport, useToastController, useToastState } from '@tamagui/toast'

const codeInputCellCount = 6

const SmsAuthenticationScreen = () => {
const router = useRouter();
 const params = useLocalSearchParams()
  const {
    isSigningUp,
    isConfirmSignUpCode,
    isConfirmResetPasswordCode,
    email,
    userInfo,
  } = params

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const authManager = useAuth()
  const dispatch = useDispatch()

  const styles = dynamicStyles(theme, appearance)
  const config = useConfig();
  
  const colorSet = theme.colors[appearance]

  const [inputFields, setInputFields] = useState({})
  const [loading, setLoading] = useState(false)
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(
    false
  )
  const [phoneNumber, setPhoneNumber] = useState(null as any)
  const [countriesPickerData, setCountriesPickerData] = useState(null)
  const [verificationId, setVerificationId] = useState(null)
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [countryModalVisible, setCountryModalVisible] = useState(false)
  const [codeInputValue, setCodeInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const myCodeInput = useBlurOnFulfill({
    //codeInputValue,
     
    value: codeInputValue,
    cellCount: codeInputCellCount,
  })
  const [codeInputProps, getCellOnLayoutHandler] = useClearByFocusCell({
    // @ts-ignore
    codeInputValue,
    value: codeInputValue,
    setCodeInputValue,
    setValue: setCodeInputValue,
  })

  const phoneRef = useRef(null as any)

  // const toast = useToastController()

  useEffect(() => {
    if (codeInputValue?.trim()?.length === codeInputCellCount) {
      onFinishCheckingCode(codeInputValue)
    }
  }, [codeInputValue])

  useEffect(() => {
    if (phoneRef && phoneRef.current) {
      setCountriesPickerData(phoneRef.current.getPickerData())
    }
  }, [phoneRef])

  const onFBButtonPress = () => {
    setLoading(true)
    authManager.loginOrSignUpWithFacebook(config).then(response => {
      if (response?.user) {
        const user = response.user
        dispatch(setUserData({ user }))
        Keyboard.dismiss()
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack', params: { user } }],
        // })
        router.replace('/(tabs)')
      } else {
        setLoading(false)
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          },
        )
      }
    })
  }

  const onGoogleButtonPress = () => {
    setLoading(true)
    authManager.loginOrSignUpWithGoogle(config).then(response => {
      if (response?.user) {
        const user = response.user
        dispatch(setUserData({ user }))
        Keyboard.dismiss()
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack', params: { user } }],
        // })
        router.replace('/(tabs)')
      } else {
        setLoading(false)
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          },
        )
      }
    })
  }

  const onAppleButtonPress = async () => {
    setLoading(true)
    authManager.loginOrSignUpWithApple(config).then(response => {
      if (response?.user) {
        const user = response.user
        dispatch(setUserData({ user }))
        Keyboard.dismiss()
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack', params: { user } }],
        // })
        router.replace('/(tabs)')

      } else {
        setLoading(false)
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          {
            cancelable: false,
          },
        )
      }
    })
  }

  const signInWithPhoneNumber = userValidPhoneNumber => {

    setLoading(true)

    authManager.sendSMSToPhoneNumber(userValidPhoneNumber).then(response => {
      setLoading(false)
      const confirmationResult = response.confirmationResult
      if (confirmationResult) {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        // @ts-ignore
        window['confirmationResult'] = confirmationResult
        setVerificationId(confirmationResult.verificationId)
        setIsCodeInputVisible(true)
        //setOpen(true);
        //showToast()

      } else {
        // Error; SMS not sent
        Alert.alert(
          '',
          localizedErrorMessage(response.error, localized),
          [{ text: localized('OK') }],
          { cancelable: false },
        )
      }
    })
  }

  // const showToast = () => {
  //   toast.show(`Code sent to your phone.`, {
  //     message: "Enter the code below to verify.",
  //   })
  // };

  const trimFields = fields => {
    var trimmedFields = {}
    Object.keys(fields).forEach(key => {
      if (fields[key]) {
        trimmedFields[key] = fields[key].trim()
      }
    })
    return trimmedFields
  }

  const signUpWithPhoneNumber = smsCode => {
    const userDetails = {
      ...trimFields(inputFields),
      phoneNumber: phoneNumber?.trim(),
      photoFile: profilePictureFile,
    }
    authManager
      .registerWithPhoneNumber(
        userDetails,
        smsCode,
        verificationId,
        config.appIdentifier,
      )
      .then(response => {
        setLoading(false)
        if (response.error) {
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{ text: localized('OK') }],
            { cancelable: false },
          )
        } else {
          const user = response.user
          console.log('user: ', user)
          dispatch(setUserData({ user }))
          Keyboard.dismiss()
          router.replace('/(tabs)')

        }
      })
  }


  const onPressSend = async () => {
    if (phoneRef.current.isValidNumber()) {
      const userValidPhoneNumber = phoneRef.current.getValue()
      setLoading(true)
      setPhoneNumber(userValidPhoneNumber)
      if (isSigningUp === 'true') {
        const { error } = await authManager.validateUsernameFieldIfNeeded(
          trimFields(inputFields),
          config,
        )

        if (error) {
          Alert.alert(
            '',
            localized(error),
            [{ text: localized('OK'), onPress: () => setLoading(false) }],
            {
              cancelable: false,
            },
          )
          return
        }
      }

      signInWithPhoneNumber(userValidPhoneNumber)
    } else {
      Alert.alert(
        '',
        localized('Please enter a valid phone number.'),
        [{ text: localized('OK') }],
        {
          cancelable: false,
        },
      )
    }
  }

  const onPressFlag = () => {
    setCountryModalVisible(true)
  }

  const onPressCancelContryModalPicker = () => {
    setCountryModalVisible(false)
  }

  const onFinishCheckingCode = newCode => {
    setIsCodeInputVisible(false);
    setLoading(true)

    if (isSigningUp === 'true') {
      signUpWithPhoneNumber(newCode)
      return
    }

    if (isSigningUp === 'false') {
      authManager.loginWithSMSCode(newCode, verificationId).then(response => {
        if (response.error) {
          setIsCodeInputVisible(true);
          setLoading(false)
          Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{ text: localized('OK') }],
            { cancelable: false },
          )

        } else {
          const user = response.user
          dispatch(setUserData({ user }))
          Keyboard.dismiss()
          router.replace('(tabs)')
        }
      })
    }
  }

  const onChangeInputFields = (text, key) => {
    setInputFields(prevFields => ({
      ...prevFields,
      [key]: text,
    }))
  }

  const selectCountry = country => {
    phoneRef.current.selectCountry(country.iso2)
  }

  const renderPhoneInput = () => {
    return (
      <>
        <PhoneInput
          style={styles.InputContainer}
          flagStyle={styles.flagStyle}
          textStyle={styles.phoneInputTextStyle}
          ref={phoneRef}
          initialCountry={'ke'}
          onPressFlag={onPressFlag}
          offset={10}
          allowZeroAfterCountryCode
          textProps={{
            placeholder: localized('Phone number'),
            placeholderTextColor: '#aaaaaa',
          }}
        />

        {countriesPickerData && (
          <CountriesModalPicker
            data={countriesPickerData}
            onChange={country => {
              selectCountry(country)
            }}
            cancelText={localized('Cancel')}
            visible={countryModalVisible}
            onCancel={onPressCancelContryModalPicker}
          />
        )}

        <TamaguiButton 
          theme="active" 
          backgroundColor={colorSet.secondaryForeground} 
          color={colorSet.primaryForeground}
          width="80%"
          margin="auto"
          onPress={onPressSend}
          >
          {localized('Send code')}
        </TamaguiButton>


      </>
    )
  }

  const renderCodeInputCell = ({ index, symbol, isFocused }) => {
    let textChild = symbol

    if (isFocused) {
      textChild = <Cursor />
    }

    return (
      <Text
        key={index}
        style={[styles.codeInputCell, isFocused && styles.focusCell]}
        onLayout={
          getCellOnLayoutHandler(index)}>
        {textChild}
      </Text>
    )
  }

  const renderCodeInput = () => {
    return (
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={isCodeInputVisible}
        snapPoints={[50]}
     
        dismissOnSnapToBottom
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        
        <Sheet.Frame 
          padding="$4" 
          justifyContent="center" 
          alignItems="center"
          space="$5" 
          backgroundColor={colorSet.primaryBackground}
        >
            <TamaguiText color={colorSet.primaryForeground} fontSize="$4" >Enter code sent to {phoneNumber} </TamaguiText>
            
            <CodeField
              ref={myCodeInput}
              {...codeInputProps}
              value={codeInputValue}
              onChangeText={setCodeInputValue}
              cellCount={codeInputCellCount}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={renderCodeInputCell}
            />

            <TouchableOpacity onPress={onPressSend}>
              <TamaguiText color={colorSet.secondaryText}>{localized("Didn't get a code? ")}
                <TamaguiText color={colorSet.primaryForeground} >Resend</TamaguiText>
              </TamaguiText>

            </TouchableOpacity>
        </Sheet.Frame>
      </Sheet>
      
    )
  }

  const renderInputField = (field, index) => {
    return (
      <TextInput
        key={index?.toString()}
        style={styles.InputContainer}
        placeholder={field.placeholder}
        placeholderTextColor="#aaaaaa"
        onChangeText={text => onChangeInputFields(text, field.key)}
        value={inputFields[field.key]}
        underlineColorAndroid="transparent"
      />
    )
  }

  const renderAsSignUpState = () => {
    return (
      <>
        <Text style={styles.title}>{localized('Create new account')}</Text>
        {!isConfirmSignUpCode && (
          <ProfilePictureSelector
            setProfilePictureFile={setProfilePictureFile}
          />
        )}

        {!isConfirmSignUpCode && config.smsSignupFields.map(renderInputField)}
        
        { renderPhoneInput() }
        {isCodeInputVisible && renderCodeInput()  }

        {isConfirmSignUpCode && (
          <Text style={styles.orTextStyle}>
            {localized('Please check your phone for a confirmation code.')}
          </Text>
        )}

        {/* {!isConfirmSignUpCode && (
          <>
            <Text style={styles.orTextStyle}> {localized('OR')}</Text>
            <TouchableOpacity
              style={styles.signWithEmailContainer}
              onPress={
                () => {}
                //() => navigation.navigate('Signup')
                }>
              <Text>{localized('Sign up with E-mail')}</Text>
            </TouchableOpacity>
          </>
        )} */}
      </>
    )
  }

  const renderAsLoginState = () => {
    const appleButtonStyle = config.isAppleAuthEnabled
      ? {
        dark: AppleButton?.Style?.WHITE,
        light: AppleButton?.Style?.BLACK,
        'no-preference': AppleButton?.Style?.WHITE,
      }
      : {}

    return (
      <>
        {isConfirmResetPasswordCode ? (
          <Text style={styles.title}>{localized('Reset Password')}</Text>
        ) : (
          <Text style={styles.title}>{localized('Login to your account')}</Text>
        )}


        {renderPhoneInput()}

        {isCodeInputVisible && renderCodeInput() }

        {isConfirmResetPasswordCode && (
          <Text style={styles.orTextStyle}>
            {localized('Please check your e-mail for a confirmation code.')}
          </Text>
        )}
        {config.isFacebookAuthEnabled && (
          <>
            <Text style={styles.orTextStyle}> {localized('OR')}</Text>

            <TouchableOpacity
              style={styles.facebookContainer}
              onPress={() => onFBButtonPress()}>
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
{/* 
   
          <TouchableOpacity
            style={styles.signWithEmailContainer}
            onPress={
              () => {}
              // () => navigation.navigate('Login')
              }>
            <Text style={styles.signWithEmailText}>
              {localized('Sign in with E-mail')}
            </Text>
          </TouchableOpacity> */}
      </>
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        keyboardShouldPersistTaps="always">
        <TouchableOpacity onPress={
          () => router.back()
          }>
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>

        {isSigningUp === 'true' && renderAsSignUpState()}

        {isSigningUp === 'false' && renderAsLoginState()}

        {isSigningUp === 'true' && (
          <TermsOfUseView
            tosLink={config.tosLink}
            privacyPolicyLink={config.privacyPolicyLink}
            style={styles.tos}
          />
        )}
      </KeyboardAwareScrollView>
      {loading && <ActivityIndicator />}
    </View>
  )
}

export default SmsAuthenticationScreen


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

const width = Dimensions.get('window').width
const codeInptCellWidth = width * 0.13

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme]
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
      marginBottom: 50,
      alignSelf: 'stretch',
      textAlign: 'left',
      marginLeft: 35,
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
      height: 48,
      borderWidth: 1,
      borderColor: colorSet.grey3,
      backgroundColor: colorSet.primaryBackground,
      paddingLeft: 10,
      color: colorSet.primaryText,
      width: '80%',
      alignSelf: 'center',
      marginBottom: 32,
      alignItems: 'center',
      borderRadius: 9,
    },

    flagStyle: {
      width: 35,
      height: 25,
      borderColor: colorSet.secondaryForeground7,
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0,
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
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
      marginTop: 20,
      alignItems: 'center',
    },
    codeInputCell: {
      width: codeInptCellWidth,
      height: 60,
      lineHeight: 55,
      fontSize: 163,
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
      marginTop: 40,
      marginBottom: 10,
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
  })
}