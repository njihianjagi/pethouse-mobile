import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {YStack, Text, Button, XStack, View, Spinner} from 'tamagui';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useTheme, useTranslations} from '../../dopebase';
import {useConfig} from '../../config';
import {Image, StyleSheet} from 'react-native';
import {updateUser} from '../../api/firebase/users/userClient';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const currentUser = useCurrentUser();

  const {localized} = useTranslations();

  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (role: 'breeder' | 'seeker') => {
    try {
      setLoading(true);
      await updateUser(currentUser?.id, {role});
      router.push(role === 'breeder' ? '/breeder' : '/seeker');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error updating user role:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      <YStack padding='$8' gap='$4'>
        <View style={styles?.logo}>
          <Image style={styles.logoImage} source={theme.icons?.logo} />
        </View>

        <Text style={styles.title}>Let's Get Started!</Text>
        <Text style={styles.caption}>
          Before you continue, please tell us whether you are searching for a
          new dog or you would like to rehome your current dog.
        </Text>
      </YStack>

      <YStack gap='$4' w='100%' paddingHorizontal='$8'>
        <Button
          theme='active'
          backgroundColor={colorSet.secondaryForeground}
          color={colorSet.primaryForeground}
          onPress={() => handleRoleSelection('seeker')}
        >
          {localized('I am looking for a new dog')}
        </Button>

        <Button
          theme='active'
          backgroundColor={colorSet.primaryForeground}
          color={colorSet.secondaryForeground}
          onPress={() => handleRoleSelection('breeder')}
          disabled={loading}
          iconAfter={loading ? <Spinner /> : <></>}
        >
          {localized('I want to rehome my dog(s)')}
        </Button>
      </YStack>
    </View>
  );
}

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
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
    alreadyHaveAnAccountContainer: {
      alignItems: 'center',
      marginTop: 8,
    },
    alreadyHaveAnAccountText: {
      color: colorSet.secondaryText,
    },
  });
};
