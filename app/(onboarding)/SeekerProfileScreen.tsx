import React, {useCallback, useEffect, useState} from 'react';
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
  debounce,
  Input,
  Sheet,
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
import allBreeds from '../../assets/data/breeds_with_group_and_traits.json';
import {updateUser} from '../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/auth';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {ChevronRight} from '@tamagui/lucide-icons';

const SeekerProfileScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState<string | undefined>();
  const [age, setAge] = useState<string | undefined>();

  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  // @ts-ignore
  navigator.geolocation = require('@react-native-community/geolocation');

  const config = useConfig();

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const dispatch = useDispatch();

  const [breeds, setBreeds] = useState<DogBreed[]>(allBreeds as DogBreed[]);

  const {localized} = useTranslations();

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

  const traitMapping = {
    apartment_friendly: 'adapts_well_to_apartment_living',
    novice_friendly: 'good_for_novice_dog_owners',
    independent: 'tolerates_being_alone',
    sensitivity_level: 'sensitivity_level',
    low_shedding: 'shedding',
    low_drooling: 'drooling_potential',
    easy_grooming: 'easy_to_groom',
    general_health: 'general_health',
    weight_gain_prone: 'potential_for_weight_gain',
    affectionate: 'best_family_dogs',
    kid_friendly: 'kid-friendly',
    dog_friendly: 'dog_friendly',
    stranger_friendly: 'friendly_toward_strangers',
    energy_level: 'high_energy_level',
    intensity: 'intensity',
    playfulness: 'potential_for_playfulness',
    easy_to_train: 'easy_to_train',
    intelligence: 'intelligence',
    mouthiness: 'potential_for_mouthiness',
    size: 'size',
    adaptable_to_weather: ['tolerates_cold_weather', 'tolerates_hot_weather'],
    high_prey_drive: 'prey_drive',
    barks_a_lot: 'tendency_to_bark_or_howl',
    wanderlust: 'wanderlust_potential',
  };

  interface TraitPreferences {
    [key: string]: number | boolean;
  }

  const [traitPreferences, setTraitPreferences] = useState<TraitPreferences>(
    {} as TraitPreferences
  );

  const handleTraitChange = (trait, value) => {
    setTraitPreferences((prev) => ({
      ...prev,
      [trait]: value,
    }));
  };

  interface DogBreed {
    name: string;
    description: string;
    height: string;
    lifeSpan: string;
    weight: string;
    image: string;
    traits: {
      [key: string]: {
        name: string;
        score: number;
      };
    };
  }

  const [filteredBreeds, setFilteredBreeds] = useState({} as any);

  const filterBreeds = useCallback(
    debounce((preferences) => {
      const filtered = breeds.filter((breed) => {
        return Object.entries(preferences).every(([trait, preference]) => {
          const mappedTrait = traitMapping[trait] || trait;

          if (Array.isArray(mappedTrait)) {
            // Handle multiple mapped traits
            return mappedTrait.every((subTrait) => {
              const breedTrait =
                breed && breed.traits && breed.traits[subTrait];
              if (!breedTrait) return true;
              return evaluateTrait(breedTrait, preference, subTrait);
            });
          } else {
            const breedTrait =
              breed && breed.traits && breed.traits[mappedTrait];
            if (!breedTrait) return true;
            return evaluateTrait(breedTrait, preference, mappedTrait);
          }
        });
      });
      console.log('Matched breeds: ', filtered.length);
      setFilteredBreeds(filtered);
    }, 300),
    [breeds]
  );

  const evaluateTrait = (breedTrait, preference, traitName) => {
    if (typeof preference === 'boolean') {
      const reverseLogic = [
        'shedding',
        'drooling_potential',
        'potential_for_weight_gain',
        'potential_for_mouthiness',
      ];
      const desiredValue = reverseLogic.includes(traitName)
        ? breedTrait.score <= 3
        : breedTrait.score > 3;
      return preference === desiredValue;
    } else {
      switch (preference) {
        case 0:
          return breedTrait.score <= 2;
        case 1:
          return breedTrait.score === 3;
        case 2:
          return breedTrait.score >= 4;
        default:
          return true;
      }
    }
  };

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
            onCheckedChange={(value) => handleTraitChange(option.name, value)}
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
                handleTraitChange(option.name, parseInt(value))
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

  useEffect(() => {
    filterBreeds(traitPreferences);
    return () => {
      filterBreeds.cancel();
    };
  }, [traitPreferences, filterBreeds]);

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

            {/* <YStack gap='$4'>
              <Accordion type='multiple'>
                {traitCategories.map((category) => (
                  <Accordion.Item key={category.name} value={category.name}>
                    <Accordion.Trigger
                      flexDirection='row'
                      justifyContent='space-between'
                    >
                      {({open}: {open: boolean}) => (
                        <>
                          <Paragraph>{category.name}</Paragraph>
                          <Square
                            animation='quick'
                            rotate={open ? '180deg' : '0deg'}
                          >
                            <ChevronDown size='$1' />
                          </Square>
                        </>
                      )}
                    </Accordion.Trigger>
                    <Accordion.Content
                      backgroundColor='$gray1'
                      borderColor='$gray9'
                    >
                      <YGroup gap='$4'>
                        {category.options.map(renderTraitOption)}
                      </YGroup>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </YStack> */}

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

          <Sheet
            open={isLocationSheetOpen}
            onOpenChange={setIsLocationSheetOpen}
            snapPointsMode='percent'
            snapPoints={[50]}
          >
            <Sheet.Overlay />
            <Sheet.Frame padding='$4' backgroundColor='$background'>
              <ScrollView
                flex={1}
                contentContainerStyle={{flex: 1}}
                keyboardShouldPersistTaps='handled'
                horizontal={true}
              >
                <GooglePlacesAutocomplete
                  placeholder='Search for a location'
                  onPress={(data, details = null) => {
                    setLocation(data.description);
                    setIsLocationSheetOpen(false);
                  }}
                  onFail={(error) => console.error(error)}
                  query={{
                    key: config.googleMapsApiKey,
                    language: 'en',
                    components: 'country:ke',
                  }}
                  textInputProps={{
                    InputComp: Input,
                  }}
                  isRowScrollable={false}
                />
              </ScrollView>
            </Sheet.Frame>
          </Sheet>
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
