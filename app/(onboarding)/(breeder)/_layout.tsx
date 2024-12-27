import {Stack, useRouter} from 'expo-router';
import {useTheme, useTranslations} from '../../../dopebase';
import {Text, View, Image} from 'react-native';
import {HeaderBackButton} from '@react-navigation/elements';
import ParallaxScrollView from '@/components/ParallaxScrollView';

const StepIndicator = ({current, total}: {current: number; total: number}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <View>
      <Text style={{color: colorSet.primaryText, fontSize: 16}}>
        Step {current} of {total}
      </Text>
    </View>
  );
};

const getStepBackPath = (currentScreen: string) => {
  switch (currentScreen) {
    case 'basic-info':
      return '/(onboarding)/(breeder)';
    case 'breeds':
      return '/(onboarding)/(breeder)/basic-info';
    case 'facilities':
      return '/(onboarding)/(breeder)/breeds';
    default:
      return '/(onboarding)/(breeder)';
  }
};

export default function BreederOnboardingLayout() {
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const router = useRouter();
  const colorSet = theme.colors[appearance];
  const TOTAL_STEPS = 3;

  const handleBack = (currentScreen: string) => {
    if (currentScreen === 'basic-info') {
      router.replace('/(onboarding)/role');
    } else {
      router.replace(getStepBackPath(currentScreen));
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleStyle: {
          color: colorSet.primaryText,
        },
        headerStyle: {
          backgroundColor: colorSet.primaryBackground,
        },
        headerTintColor: colorSet.primaryText,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: localized('Welcome'),
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name='basic-info'
        options={{
          title: localized('Basic Info'),
          // headerRight: () => <StepIndicator current={1} total={TOTAL_STEPS} />,
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => handleBack('basic-info')}
            />
          ),
        }}
      />
      <Stack.Screen
        name='breeds'
        options={{
          title: localized('Breeds'),
          // headerRight: () => <StepIndicator current={2} total={TOTAL_STEPS} />,
          headerLeft: (props) => (
            <HeaderBackButton {...props} onPress={() => handleBack('breeds')} />
          ),
        }}
      />
      <Stack.Screen
        name='facilities'
        options={{
          title: localized('Facilities'),
          // headerRight: () => <StepIndicator current={3} total={TOTAL_STEPS} />,
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => handleBack('facilities')}
            />
          ),
        }}
      />
    </Stack>
  );
}
