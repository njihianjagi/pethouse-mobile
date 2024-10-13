import React, {useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
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
import {setUserData} from '../../redux/auth';
import {ChevronRight} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../hooks/useBreedSearch';

const SeekerProfileScreen = () => {
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

  const traitCategories = [
    {
      name: 'Lifestyle Fit',
      caption: 'Find a dog that suits your daily life',
      options: [
        {
          name: 'apartment_friendly',
          type: 'switch',
          label: 'Apartment Friendly',
          defaultValue: true,
        },
        {
          name: 'novice_friendly',
          type: 'switch',
          label: 'Good for Novice Owners',
          defaultValue: true,
        },
        {
          name: 'independent',
          type: 'switch',
          label: 'Can Be Left Alone',
          // defaultValue: false,
        },
      ],
    },
    {
      name: 'Care Requirements',
      caption: 'Consider the grooming and health needs',
      options: [
        {
          name: 'low_shedding',
          type: 'switch',
          label: 'Low Shedding',
          defaultValue: true,
        },
        {
          name: 'low_drooling',
          type: 'switch',
          label: 'Low Drooling',
          defaultValue: true,
        },
        {
          name: 'easy_grooming',
          type: 'switch',
          label: 'Easy to Groom',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'Temperament',
      caption: 'Choose your preferred temperament traits',
      options: [
        {
          name: 'playfulness',
          type: 'switch',
          label: 'Playful',
        },
        {
          name: 'kid_friendly',
          type: 'switch',
          label: 'Kid Friendly',
          // defaultValue: true,
        },
        {
          name: 'stranger_friendly',
          type: 'switch',
          label: 'Stranger Friendly',
          // defaultValue: false,
        },
      ],
    },
    {
      name: 'Training & Obedience',
      caption: 'Pick your preferred learning style',
      options: [
        {
          name: 'easy_to_train',
          type: 'switch',
          label: 'Easy to Train',
        },
        {
          name: 'intelligent',
          type: 'switch',
          label: 'Highly Intelligent',
        },
        {
          name: 'high_prey_drive',
          type: 'switch',
          label: 'High Prey Drive',
          // defaultValue: false,
        },
      ],
    },
    {
      name: 'Physical Characteristics',
      caption: "The dog's size and adaptability to different environments",
      options: [
        {
          name: 'size',
          type: 'toggle',
          values: ['Small', 'Medium', 'Large'],
          defaultValue: 1, // Medium
        },
        {
          name: 'energy_level',
          type: 'toggle',
          values: ['Low', 'Moderate', 'High'],
          defaultValue: 1, // Moderate
        },
      ],
    },
  ];

  const {
    traitPreferences,
    handleTraitToggle,
    filteredBreeds,
    loading: breedsLoading,
  } = useBreedSearch();

  const renderTraitOption = (option) => {
    if (option.type === 'switch') {
      return (
        <ListItem>
          <ListItem.Text>{option.label}</ListItem.Text>
          {/* <Checkbox
            checked={!!traitPreferences[option.name]}
            onCheckedChange={(value) => handleTraitChange(option.name, value)}
          >
            <Checkbox.Indicator>
              <Check />
            </Checkbox.Indicator>
          </Checkbox> */}
          <Switch
            backgroundColor={
              !!traitPreferences[option.name] ? colorSet.grey3 : colorSet.grey0
            }
            checked={!!traitPreferences[option.name]}
            onCheckedChange={(value) => handleTraitToggle(option.name, value)}
          >
            <Switch.Thumb
              animation='quicker'
              backgroundColor={colorSet.primaryForeground}
            />
          </Switch>
        </ListItem>
      );
    } else if (option.type === 'toggle') {
      return (
        <ListItem key={option.name} width='100%'>
          <YStack flex={1} gap='$4'>
            <ListItem.Text>
              {option.name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </ListItem.Text>
            <ToggleGroup
              type='single'
              value={traitPreferences[option.name]?.toString()}
              onValueChange={(value) =>
                handleTraitToggle(option.name, parseInt(value))
              }
              flex={1}
            >
              {option.values.map((value, index) => (
                <ToggleGroup.Item
                  key={value}
                  value={index?.toString()}
                  flex={1}
                >
                  <Text>{value}</Text>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </YStack>
        </ListItem>
      );
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response: any = await updateUser(currentUser.id, {
        preferredBreeds: filteredBreeds.map((breed) => breed.name),
        traitPreferences: traitPreferences,
      });

      await dispatch(
        setUserData({
          user: response.user,
        })
      );
      router.replace('(tabs)');
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
    if (currentStep < traitCategories.length - 1) {
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
                    title={traitCategories[currentStep].name}
                    subTitle={traitCategories[currentStep].caption} // You'll need to define icons for each category
                    iconAfter={ChevronRight}
                  />
                </YGroup.Item>
                {traitCategories[currentStep].options.map(renderTraitOption)}
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
                {currentStep === traitCategories.length - 1
                  ? 'Save'
                  : traitCategories[currentStep + 1].name}
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

export default SeekerProfileScreen;
