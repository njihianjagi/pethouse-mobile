import React, { useState, useEffect } from 'react'
import { Image, Keyboard, Platform, Text, View,StyleSheet, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import messaging from '@react-native-firebase/messaging'
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
} from '../../dopebase'
import { setUserData } from '../../redux/auth'


import { useAuth } from '../../hooks/useAuth'
import useCurrentUser from '../../hooks/useCurrentUser'
import { useConfig } from '../../config'
import { Link, useRouter } from 'expo-router'
import { View as TamaguiView, YStack, Button as TamaguiButton, Text as TamaguiText, Spinner } from 'tamagui'
import { updateUser } from '../../api/firebase/users/userClient'

const WelcomeScreen = props => {
  const currentUser = useCurrentUser()
  const router = useRouter();
  
  const dispatch = useDispatch()
  const config = useConfig()

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const colorSet = theme.colors[appearance]

  const [isLoading, setIsLoading] = useState(true)

  const authManager = useAuth()

  const { title, caption } = props

  useEffect(() => {
    setIsLoading(true)
    tryToLoginFirst()
  }, [])

  const handleInitialNotification = async () => {
    const userID = currentUser?.id || currentUser?.userID
    const intialNotification = await messaging().getInitialNotification()

    if (intialNotification && Platform.OS === 'android') {
      const {
        // @ts-ignore
        data: { channelID, type },
      } = intialNotification

      if (type === 'chat_message') {
        handleChatMessageType(channelID, currentUser.name)
      }
    }

    if (userID && Platform.OS === 'ios') {
      updateUser(userID, { badgeCount: 0 })
    }
  }

  const tryToLoginFirst = async () => {
    if (!authManager?.retrievePersistedAuthUser) {
      setIsLoading(false);
      return;
    }

    authManager?.retrievePersistedAuthUser(config)
      .then(response => {
        console.log('res: ', response)
        if (response?.user) {
          const user = response.user
          dispatch(
            setUserData({
              user: response.user,
            }),
          )
          Keyboard.dismiss()
          if (user?.role === 'admin') {
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'AdminStack', params: { user } }],
            // })
            router.push('/(tabs)')
          } else {

            router.push('/(tabs)')
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'MainStack', params: { user } }],
            // })
          }
          if (Platform.OS !== 'web') {
            handleInitialNotification()
          }
          return
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.log(error)
        setIsLoading(false)
      })
  }

  const handleChatMessageType = (channelID, name) => {
    const channel = {
      id: channelID,
      channelID,
      name,
    }

    // navigation.navigate('PersonalChat', {
    //   channel,
    //   openedFromPushNotification: true,
    // })
  }

  if (isLoading == true) {
    return (
      <View style={styles.container}>
        {/* <ActivityIndicator /> */}
        <Spinner size="large" />
      </View>
    )
  }

  return (
    // <View style={styles.container}>
    //   {props.delayedMode && (
    //     <DismissButton
    //       style={styles.dismissButton}
    //       tintColor={theme.colors[appearance].primaryForeground}
    //       onPress={
    //         () => router.back()
    //       }
    //     />
    //   )}
      // <View style={styles?.logo}>
      //   <Image
      //     style={styles.logoImage}
      //     source={
      //       props.delayedMode ? theme.icons.delayedLogo : theme.icons?.logo
      //     }
      //   />
      // </View>
      // <Text style={styles.title}>
      //   {title ? title : config.onboardingConfig.welcomeTitle}
      // </Text>
      // <Text style={styles.caption}>
      //   {caption ? caption : config.onboardingConfig.welcomeCaption}
      // </Text>

    //   <Button
    //     text={localized('Log In')}
    //     style={styles.loginContainer}
    //     textStyle={styles.loginText}
    //     onPress={
    //       () => config.isSMSAuthEnabled
    //        ? router.push({pathname: '/SmsAuthenticationScreen/SmsAuthenticationScreen', params: { isSigningUp: 'false' }}) 
    //        : router.push('/LoginScreen/LoginScreen')
    //     }>
    //     {localized('Log In')}
    //   </Button>

    //   <Button
    //     text={localized('Sign Up')}
    //     style={styles.signupContainer}
    //     textStyle={styles.signupText}
    //     onPress={
    //       () => config.isSMSAuthEnabled
    //       ? router.push({pathname: '/SmsAuthenticationScreen/SmsAuthenticationScreen', params: { isSigningUp: 'true' }}) 
    //       : router.push('/SignupScreen/SignupScreen')
    //     }>
    //     {localized('Sign Up')}
    //   </Button>
    <TamaguiView  
      flex={1}
      alignItems="center"
      justifyContent="center"
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

      {/* <TamaguiView display="flex" ></TamaguiView> */}

      <YStack padding="$8" space="$4" {...props}>
        <Text style={styles.title}>
          {title ? title : config.onboardingConfig.welcomeTitle}
        </Text>
        <Text style={styles.caption}>
          {caption ? caption : config.onboardingConfig.welcomeCaption}
        </Text>
        
        <TamaguiButton 
          theme="active" 
          backgroundColor={colorSet.secondaryForeground} 
          color={colorSet.primaryForeground}
          onPress={
          () => config.isSMSAuthEnabled
           ? router.push({pathname: '/SmsAuthenticationScreen', params: { isSigningUp: 'true' }}) 
           : router.push('/SignupScreen')
        }>
          {localized('Get Started')}
        </TamaguiButton>


        <TouchableOpacity
            style={styles.alreadyHaveAnAccountContainer}
            onPress={
              () => config.isSMSAuthEnabled
              ? router.push({pathname: '/SmsAuthenticationScreen', params: { isSigningUp: 'false' }}) 
              : router.push('/SignupScreen')
            }>
            <Text style={styles.alreadyHaveAnAccountText}>
              {localized('Already have an account? ')}
              <TamaguiText color={colorSet.primaryForeground} >Login</TamaguiText>
            </Text>
          </TouchableOpacity> 
          
      </YStack>
     </TamaguiView>

  )
}

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme]
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
      marginBottom: 60,
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
  })
}

export default WelcomeScreen
