import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, StyleSheet, TouchableOpacity} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Tabs,
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
  Label,
  Sheet,
  ScrollView,
  ListItem,
  YGroup,
  Paragraph,
  ToggleGroup,
  Accordion,
  Square,
  Switch,
} from 'tamagui';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useConfig} from '../../config';
import {useTheme} from '../../dopebase';
import allBreeds from '../../assets/data/breeds_with_group_and_traits.json';
import {updateUser} from '../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/auth';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {X, Plus, ChevronDown} from '@tamagui/lucide-icons';

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
  const [activeTab, setActiveTab] = useState('tab1');

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const dispatch = useDispatch();

  const [breeds, setBreeds] = useState<DogBreed[]>(allBreeds as DogBreed[]);

  const traitCategories = [
    {
      name: 'Lifestyle Fit',
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
          defaultValue: false,
        },
        {
          name: 'sensitivity_level',
          type: 'toggle',
          values: ['Low', 'Medium', 'High'],
          defaultValue: 1, // Medium
        },
      ],
    },
    {
      name: 'Care Requirements',
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
        {
          name: 'general_health',
          type: 'toggle',
          values: ['Prone to Issues', 'Average', 'Very Healthy'],
          defaultValue: 2, // Very Healthy
        },
        {
          name: 'weight_gain_prone',
          type: 'switch',
          label: 'Prone to Weight Gain',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'Temperament',
      options: [
        {
          name: 'affectionate',
          type: 'switch',
          label: 'Affectionate with Family',
          defaultValue: true,
        },
        {
          name: 'kid_friendly',
          type: 'switch',
          label: 'Kid Friendly',
          defaultValue: true,
        },
        {
          name: 'dog_friendly',
          type: 'switch',
          label: 'Dog Friendly',
          defaultValue: true,
        },
        {
          name: 'stranger_friendly',
          type: 'switch',
          label: 'Stranger Friendly',
          defaultValue: false,
        },
        {
          name: 'energy_level',
          type: 'toggle',
          values: ['Low', 'Moderate', 'High'],
          defaultValue: 1, // Moderate
        },
        {
          name: 'intensity',
          type: 'toggle',
          values: ['Laid-Back', 'Medium', 'Vigorous'],
          defaultValue: 1, // Medium
        },
        {
          name: 'playfulness',
          type: 'toggle',
          values: ['Reserved', 'Playful', 'Very Playful'],
          defaultValue: 1, // Playful
        },
      ],
    },
    {
      name: 'Training & Intelligence',
      options: [
        {
          name: 'easy_to_train',
          type: 'switch',
          label: 'Easy to Train',
          defaultValue: true,
        },
        {
          name: 'intelligence',
          type: 'toggle',
          values: ['Average', 'Bright', 'Highly Intelligent'],
          defaultValue: 1, // Bright
        },
        {
          name: 'mouthiness',
          type: 'switch',
          label: 'Mouthy',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'Physical Characteristics',
      options: [
        {
          name: 'size',
          type: 'toggle',
          values: ['Small', 'Medium', 'Large'],
          defaultValue: 1, // Medium
        },
        {
          name: 'adaptable_to_weather',
          type: 'switch',
          label: 'Adaptable to Weather',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'Behavioral Traits',
      options: [
        {
          name: 'high_prey_drive',
          type: 'switch',
          label: 'High Prey Drive',
          defaultValue: false,
        },
        {
          name: 'barks_a_lot',
          type: 'switch',
          label: 'Tends to Bark or Howl',
          defaultValue: false,
        },
        {
          name: 'wanderlust',
          type: 'switch',
          label: 'Wanderlust Potential',
          defaultValue: false,
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
    () => {
      // Initialize traitPreferences with default values
      const initialPreferences = {} as TraitPreferences;
      traitCategories.forEach((category) => {
        category.options.forEach((option) => {
          initialPreferences[option.name] = option.defaultValue;
        });
      });
      return initialPreferences;
    }
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

  const [filteredBreeds, setFilteredBreeds] = useState(
    allBreeds.slice(0, 10) as DogBreed[]
  ); // Use slice instead of splice to avoid mutating original array

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
        <XStack key={option.name} gap='$2' justifyContent='space-between'>
          <Label htmlFor={option.name}>{option.label}</Label>
          <Switch
            id={option.name}
            checked={!!traitPreferences[option.name]}
            onCheckedChange={(value) => handleTraitChange(option.name, value)}
          />
        </XStack>
      );
    } else if (option.type === 'toggle') {
      return (
        <YStack key={option.name} gap='$2'>
          <Label htmlFor={option.name}>
            {option.name
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Label>
          {/* <ToggleGroup
            id={option.name}
            type='single'
            value={traitPreferences[option.name].toString()}
            onValueChange={(value) =>
              handleTraitChange(option.name, parseInt(value))
            }
          >
            {option.values.map((value, index) => (
              <ToggleGroup.Item key={value} value={index.toString()} size='$3'>
                <Text>{value}</Text>
              </ToggleGroup.Item>
            ))}
          </ToggleGroup> */}
        </YStack>
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
    const response: any = await updateUser(currentUser.id, {
      //kennelId: newKennel.id,
    });
    await dispatch(
      setUserData({
        user: response.user,
      })
    );
  };

  const tabs = ['tab1', 'tab2', 'tab3'];
  const currentIndex = tabs.indexOf(activeTab);

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
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
        <KeyboardAwareScrollView
          style={{width: '100%', height: '100%'}}
          keyboardShouldPersistTaps='always'
        >
          <YStack p='$8' gap='$6'>
            <YStack gap='$4'>
              <View style={styles?.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <Text style={styles.title}>
                Awesome! Let's set up your profile
              </Text>
              <Text style={styles.caption}>
                Complete your profile to connect with potential breeders and
                find your perfect canine companion.
              </Text>
            </YStack>
            <Tabs
              defaultValue='tab1'
              orientation='horizontal'
              flexDirection='column'
              width='100%'
              value={activeTab}
              onValueChange={setActiveTab}
              // height='80%'
              // borderRadius='$4'
              // borderWidth={1}
              // borderColor='$borderColor'
              // overflow='hidden'
            >
              <Tabs.List
                disablePassBorderRadius='bottom'
                aria-label='Manage your account'
                marginBottom='$4'
                borderColor={colorSet.primaryForeground}
              >
                <Tabs.Tab flex={1} value='tab1'>
                  <Text fontFamily='$body'>Profile</Text>
                </Tabs.Tab>
                <Separator vertical />
                <Tabs.Tab flex={1} value='tab2'>
                  <Text fontFamily='$body'>Breed Preferences</Text>
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Content value='tab1'>
                <YStack gap='$2'>
                  <Text fontSize='$6' fontWeight='bold' color='$gray9'>
                    Tell us a bit about yourself
                  </Text>

                  <YStack gap='$0'>
                    <Label htmlFor='name'> Name</Label>
                    <Input
                      placeholder='Your Name'
                      value={userName}
                      onChangeText={setUserName}
                    />
                  </YStack>

                  <YStack gap='$0' paddingBottom='$2'>
                    <Label htmlFor='location'> Location</Label>
                    <Input
                      placeholder='Your Location'
                      value={location}
                      onFocus={() => setIsLocationSheetOpen(true)}
                      onChangeText={setLocation}
                      onPress={Keyboard.dismiss}
                      flex={1}
                    />
                  </YStack>
                </YStack>
              </Tabs.Content>

              <Tabs.Content value='tab2'>
                <ScrollView>
                  <YStack gap='$4'>
                    <Text fontSize='$6' fontWeight='bold'>
                      Select Your Preferred Traits
                    </Text>
                    <Text fontSize='$4'>
                      Matched Breeds: {filteredBreeds.length}
                    </Text>
                    <Accordion type='multiple'>
                      {traitCategories.map((category) => (
                        <Accordion.Item
                          key={category.name}
                          value={category.name}
                        >
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
                          <Accordion.Content>
                            <YGroup gap='$4'>
                              {category.options.map(renderTraitOption)}
                            </YGroup>
                          </Accordion.Content>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </YStack>
                </ScrollView>
              </Tabs.Content>
            </Tabs>

            <XStack justifyContent='space-between' padding='$2'>
              <Button
                onPress={handleBack}
                disabled={currentIndex === 0}
                opacity={currentIndex === 0 ? 0.5 : 1}
              >
                Back
              </Button>

              {currentIndex !== tabs.length - 1 && (
                <Button
                  onPress={handleNext}
                  disabled={currentIndex === tabs.length - 1}
                  opacity={currentIndex === tabs.length - 1 ? 0.5 : 1}
                >
                  Next
                </Button>
              )}

              {currentIndex == tabs.length - 1 && (
                <Button
                  onPress={handleSave}
                  disabled={loading}
                  iconAfter={loading ? <Spinner /> : null}
                >
                  {loading ? '' : 'Save'}
                </Button>
              )}
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
        </KeyboardAwareScrollView>
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
