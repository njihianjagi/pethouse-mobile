import React, {useMemo, useState} from 'react';
import {Alert, Pressable, StyleSheet} from 'react-native';
import {localizedErrorMessage} from '../../utils/ErrorCode';

import {
  Text,
  View,
  YStack,
  Image,
  Spinner,
  Separator,
  XStack,
  Button,
  ScrollView,
  ListItem,
  YGroup,
  ToggleGroup,
  Switch,
} from 'tamagui';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useConfig} from '../../config';
import {useTheme, useTranslations} from '../../dopebase';
import {updateUser} from '../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/reducers/auth';
import {ChevronRight, Star, StarOff} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../hooks/useBreedSearch';

const SeekerOnboardingScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const dispatch = useDispatch();
  const {localized} = useTranslations();

  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  const [loading, setLoading] = useState(false);

  // @ts-ignore
  navigator.geolocation = require('@react-native-community/geolocation');

  const {allBreeds, traitPreferences, filteredBreeds, updateFilter} =
    useBreedSearch();

  const traitGroups: any = allBreeds[0].traits;

  const renderStarRating = (traitName: string, currentRating: number = 0) => {
    return (
      <XStack gap='$0.5' alignItems='center'>
        {[1, 2, 3, 4, 5].map((score) => (
          <Pressable
            key={score}
            onPress={() =>
              updateFilter('traitPreferences', {[traitName]: score})
            }
          >
            {score <= (currentRating || 0) ? (
              <Star size={24} color={theme.colors[appearance].primary} />
            ) : (
              <StarOff
                size={24}
                color={theme.colors[appearance].primary}
                opacity={0.5}
              />
            )}
          </Pressable>
        ))}
      </XStack>
    );
  };

  const renderTraitOption = (trait) => {
    const traitKey = trait.name.toLowerCase().replace(/\s+/g, '_');
    return (
      <YStack key={traitKey}>
        <ListItem pressStyle={{opacity: 0.8}} paddingVertical='$3'>
          <XStack flex={1} justifyContent='space-between' alignItems='center'>
            <Text>{trait.name}</Text>
            {renderStarRating(traitKey, traitPreferences[traitKey] as number)}
          </XStack>
        </ListItem>
        <Separator />
      </YStack>
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response: any = await updateUser(currentUser.id, {
        traitPreferences: traitPreferences,
      });

      await dispatch(
        setUserData({
          user: response.user,
        })
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        '',
        localizedErrorMessage(error, localized),
        [{text: localized('OK')}],
        {
          cancelable: false,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < Object.keys(traitGroups).length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      {loading ? (
        <Spinner
          size='large'
          color={theme.colors[appearance].primaryForeground}
        />
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
            <YStack gap='$4' padding='$4'>
              <View style={styles?.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <Text style={styles.title}>Hey, {currentUser?.firstName}</Text>
              <Text style={styles.caption}>
                Select your preferred dog traits to help us match you with
                compatible breeds and find your perfect canine companion.
              </Text>
            </YStack>

            <YStack gap='$4'>
              <YGroup separator={<Separator />} gap='$2'>
                <YGroup.Item>
                  <ListItem
                    title={Object.keys(traitGroups[currentStep])[0]}
                    iconAfter={ChevronRight}
                  />
                </YGroup.Item>
                {Object.entries(traitGroups[currentStep].traits).map(
                  ([_, trait]) => renderTraitOption(trait)
                )}
              </YGroup>
            </YStack>

            <XStack justifyContent='space-between' padding='$2'>
              <Button
                onPress={handleBack}
                disabled={currentStep === 0}
                chromeless
              >
                Back
              </Button>

              <Button
                onPress={handleNext}
                iconAfter={<ChevronRight />}
                themeShallow
                icon={loading ? <Spinner /> : undefined}
              >
                {currentStep === traitGroups.length - 1
                  ? 'Save'
                  : traitGroups[currentStep + 1].name}
              </Button>
            </XStack>
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

export default SeekerOnboardingScreen;
