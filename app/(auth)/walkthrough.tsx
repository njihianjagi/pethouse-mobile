import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
// import { useNavigation } from '@react-navigation/core'
import {useTheme, useTranslations} from '../../dopebase';
import deviceStorage from '../../utils/AuthDeviceStorage';
import {useConfig} from '../../config';
import {Href, useRouter} from 'expo-router';
import {observer} from '@legendapp/state/react';

const WalkthroughScreen = observer(() => {
  // const navigation = useNavigation()
  const router = useRouter();
  const config = useConfig();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);

  const slides = config.onboardingConfig.walkthroughScreens.map(
    (screenSpec, index) => {
      return {
        key: index,
        text: screenSpec.description,
        title: screenSpec.title,
        image: screenSpec.icon,
      };
    }
  );

  const _onDone = async () => {
    deviceStorage.setShouldShowOnboardingFlow('false');
    if (config?.isDelayedLoginEnabled) {
      // navigation.navigate('DelayedHome')
      router.push('delayed-login' as Href);
      return;
    }
    router.push('welcome' as Href);
    // navigation.navigate('LoginStack', { screen: 'Welcome' })
  };

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerShown: false,
  //   })
  // }, [navigation])

  const _renderItem = ({item, dimensions}) => (
    <View style={[styles.container, dimensions]}>
      <Image
        style={styles.image}
        source={item.image}
        // @ts-ignore
        size={100}
        color='white'
      />
      <View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );

  const _renderNextButton = () => {
    return <Text style={styles.button}>{localized('Next')}</Text>;
  };

  const _renderSkipButton = () => {
    return <Text style={styles.button}>{localized('Skip')}</Text>;
  };

  const _renderDoneButton = () => {
    return <Text style={styles.button}>{localized('Done')}</Text>;
  };

  return (
    <AppIntroSlider
      data={slides}
      slides={slides}
      onDone={_onDone}
      // @ts-ignore
      renderItem={_renderItem}
      //Handler for the done On last slide
      showSkipButton={true}
      onSkip={_onDone}
      renderNextButton={_renderNextButton}
      renderSkipButton={_renderSkipButton}
      renderDoneButton={_renderDoneButton}
    />
  );
});

export default WalkthroughScreen;

const dynamicStyles = (theme, colorScheme) => {
  return StyleSheet.create({
    title: {
      fontSize: 25,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingBottom: 25,
      color: 'white',
    },
    text: {
      fontSize: 18,
      textAlign: 'center',
      color: 'white',
      paddingLeft: 10,
      paddingRight: 10,
    },
    image: {
      width: 100,
      height: 100,
      marginBottom: 60,
      tintColor: 'white',
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors[colorScheme].primaryForeground,
      height: '100%',
      width: '100%',
    },
    button: {
      fontSize: 18,
      color: 'white',
      marginTop: 10,
    },
  });
};
