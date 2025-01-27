import React, {useState, useEffect} from 'react';
import {useRouter} from 'expo-router';
import {StyleSheet} from 'react-native';
import {
  YStack,
  Button,
  Text,
  View,
  Image,
  ScrollView,
  Spinner,
  YGroup,
  ListItem,
  Separator,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {CheckCircle, Circle} from '@tamagui/lucide-icons';
import {updateUser} from '../../api/firebase/users/userClient';
import {setUserData} from '../../redux/reducers/auth';
import {useDispatch} from 'react-redux';

const OnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);

    if (!currentUser) return;

    console.log('currentUser: ', currentUser);
    // If user already has a role, redirect to appropriate screen
    if (currentUser.role) {
      if (currentUser.role === 'breeder') {
        router.replace('/(onboarding)/(breeder)');
      } else if (currentUser.role === 'seeker') {
        router.replace('/(onboarding)/(seeker)');
      }
    }

    setLoading(false);
  }, [currentUser, router]);

  const handleContinue = async () => {
    if (!role) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...currentUser,
        role,
        onboardingComplete: false,
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData(userData));

      // Redirect to the index page of the appropriate role
      if (role === 'breeder') {
        router.push('/(onboarding)/(breeder)');
      } else {
        router.push('/(onboarding)/(seeker)');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
      flex={1}
    >
      {loading ? (
        <Spinner size='large' color={colorSet.primaryForeground} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$2' padding='$4'>
              <View style={styles.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <YStack gap='$2'>
                <Text style={styles.title}>
                  Hey, {currentUser?.firstName || currentUser?.username}
                </Text>

                <Text style={styles.caption}>
                  Tell us a bit about yourself to get started
                </Text>
              </YStack>
            </YStack>

            <YGroup bordered>
              <YGroup.Item>
                <ListItem
                  pressTheme
                  padding='$4'
                  theme='active'
                  onPress={() => setRole('seeker')}
                  title='Dog Seeker'
                  subTitle='I am looking for a new dog'
                  iconAfter={
                    role === 'seeker' ? (
                      <CheckCircle color={colorSet.primaryForeground} />
                    ) : (
                      <Circle color='$gray9' />
                    )
                  }
                />
              </YGroup.Item>
              <Separator />
              <YGroup.Item>
                <ListItem
                  pressTheme
                  padding='$4'
                  theme='active'
                  onPress={() => setRole('breeder')}
                  title='Dog Breeder'
                  subTitle='I want to rehome my dog(s)'
                  iconAfter={
                    role === 'breeder' ? (
                      <CheckCircle color={colorSet.primaryForeground} />
                    ) : (
                      <Circle color='$gray9' />
                    )
                  }
                />
              </YGroup.Item>
            </YGroup>

            <Button
              backgroundColor={colorSet.secondaryForeground}
              color={colorSet.primaryForeground}
              onPress={handleContinue}
              disabled={!role || loading}
            >
              {loading ? localized('Please wait...') : localized('Continue')}
            </Button>
          </YStack>
        </ScrollView>
      )}
    </View>
  );
};

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
      marginBottom: 0,
      textAlign: 'center',
    },
    caption: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: colorSet.primaryForeground,
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
  });
};

export default OnboardingScreen;
