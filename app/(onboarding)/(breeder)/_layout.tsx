import {Slot, useRouter} from 'expo-router';
import {useTheme} from '../../../dopebase';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {Button, Image} from 'tamagui';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

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

export default function BreederOnboardingLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    // Logic to navigate back
    router.back();
  };

  return (
    <SafeAreaView style={{flex: 1, paddingTop: insets.top}}>
      <ParallaxScrollView
        headerImage={
          <Image
            source={require('../../../assets/images/doggo_2.png')}
            objectFit='cover'
          />
        }
        headerBackgroundColor={{dark: '#000000', light: '#fffffff'}}
      >
        <Slot />
      </ParallaxScrollView>
    </SafeAreaView>
  );
  // return (
  //   <Stack
  //     screenOptions={{
  //       headerShown: true,
  //       headerShadowVisible: false,
  //       headerTitleStyle: {
  //         color: colorSet.primaryText,
  //       },
  //       headerStyle: {
  //         backgroundColor: colorSet.primaryBackground,
  //       },
  //       headerTintColor: colorSet.primaryText,
  //     }}
  //   >
  //     <Stack.Screen
  //       name='index'
  //       options={{
  //         title: localized('Welcome'),
  //         headerBackVisible: false,
  //       }}
  //     />
  //     <Stack.Screen
  //       name='basic-info'
  //       options={{
  //         title: localized('Basic Info'),
  //         // headerRight: () => <StepIndicator current={1} total={TOTAL_STEPS} />,
  //         headerLeft: (props) => (
  //           <HeaderBackButton
  //             {...props}
  //             onPress={() => handleBack('basic-info')}
  //           />
  //         ),
  //       }}
  //     />
  //     <Stack.Screen
  //       name='breeds'
  //       options={{
  //         title: localized('Breeds'),
  //         // headerRight: () => <StepIndicator current={2} total={TOTAL_STEPS} />,
  //         headerLeft: (props) => (
  //           <HeaderBackButton {...props} onPress={() => handleBack('breeds')} />
  //         ),
  //       }}
  //     />
  //     <Stack.Screen
  //       name='facilities'
  //       options={{
  //         title: localized('Facilities'),
  //         // headerRight: () => <StepIndicator current={3} total={TOTAL_STEPS} />,
  //         headerLeft: (props) => (
  //           <HeaderBackButton
  //             {...props}
  //             onPress={() => handleBack('facilities')}
  //           />
  //         ),
  //       }}
  //     />
  //   </Stack>
  // );
}
