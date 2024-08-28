import React from 'react'
import WelcomeScreen from './WelcomeScreen'
import { useConfig } from '../../config';

export default function DelayedLoginScreen(props) {
  const { navigation } = props
  const config = useConfig();
  return (
    <WelcomeScreen
      navigation={navigation}
      title={config.onboardingConfig.delayedLoginTitle}
      caption={config.onboardingConfig.delayedLoginCaption}
      delayedMode={true}
    />
  )
}
