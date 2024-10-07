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
} from 'tamagui';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useConfig} from '../../config';
import {useTheme} from '../../dopebase';
import allBreeds from '../../assets/data/breeds_with_group.json';
import {updateUser} from '../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/auth';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {X, Plus} from '@tamagui/lucide-icons';

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

  const [isBreedsSheetOpen, setIsBreedsSheetOpen] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState(null as any);

  // Handle search text change
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleSelectBreed = (breed) => {
    setSelectedBreed(breed);
    setIsBreedsSheetOpen(false);
    Keyboard.dismiss();
  };

  const handleRemoveBreed = () => {
    setSelectedBreed(null);
  };

  const [searchText, setSearchText] = useState('');
  const [filteredBreeds, setFilteredBreeds] = useState(allBreeds.slice(0, 10)); // Use slice instead of splice to avoid mutating original array

  // Debounced search function using Lodash
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (typeof text !== 'string') {
        console.error('Search text is not a string:', text);
        return;
      }

      const sanitizedText = text.trim().toLowerCase();
      if (sanitizedText === '') {
        setFilteredBreeds(allBreeds.slice(0, 10)); // Reset to initial state
        return;
      }

      const searchRegex = new RegExp(sanitizedText, 'i');

      const matches = allBreeds.filter((breed) => {
        if (typeof breed.name !== 'string') {
          console.warn('Breed name is not a string:', breed.name);
          return false;
        }
        return searchRegex.test(breed.name);
      });

      setFilteredBreeds(matches.length > 0 ? matches : []);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
                  <Text fontFamily='$body'>Desired Traits</Text>
                </Tabs.Tab>
                <Separator vertical />
                <Tabs.Tab flex={1} value='tab3'>
                  <Text fontFamily='$body'>Breeds</Text>
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
                <YStack p='$4'>
                  <Text>Descrbibe your perfect pawtner</Text>
                  {/* Add form fields for desired traits */}
                </YStack>
              </Tabs.Content>

              <Tabs.Content value='tab3'>
                <YStack gap='$4'>
                  <Text>Select your preferred breed</Text>
                  {selectedBreed ? (
                    <YGroup bordered>
                      <YGroup.Item>
                        <ListItem
                          title={selectedBreed.name}
                          subTitle={`${selectedBreed.breedGroup} group`}
                          iconAfter={
                            <X size='$1' onPress={handleRemoveBreed} />
                          }
                        />
                      </YGroup.Item>
                      <Separator />
                      <YGroup.Item>
                        <YStack gap='$4' paddingTop='$4' paddingHorizontal='$4'>
                          <Text>Gender</Text>
                          <ToggleGroup
                            type='single'
                            value={gender}
                            onValueChange={(value) => setGender(value)}
                          >
                            <ToggleGroup.Item
                              flex={1}
                              value='male'
                              aria-label='Male'
                            >
                              <Text>Male</Text>
                            </ToggleGroup.Item>
                            <ToggleGroup.Item
                              flex={1}
                              value='female'
                              aria-label='Female'
                            >
                              <Text>Female</Text>
                            </ToggleGroup.Item>
                            <ToggleGroup.Item
                              flex={1}
                              value='any'
                              aria-label='Any'
                            >
                              <Text>Any</Text>
                            </ToggleGroup.Item>
                          </ToggleGroup>
                        </YStack>
                      </YGroup.Item>
                      <YGroup.Item>
                        <YStack gap='$4' padding='$4'>
                          <Text>Age</Text>
                          <ToggleGroup
                            type='single'
                            value={age}
                            onValueChange={(value) => setAge(value)}
                          >
                            <ToggleGroup.Item
                              flex={1}
                              value='puppy'
                              aria-label='Puppy'
                            >
                              <Text>Puppy</Text>
                            </ToggleGroup.Item>
                            <ToggleGroup.Item
                              flex={1}
                              value='adolescent'
                              aria-label='Adolescent'
                            >
                              <Text>Adolescent</Text>
                            </ToggleGroup.Item>
                            <ToggleGroup.Item
                              flex={1}
                              value='adult'
                              aria-label='Adult'
                            >
                              <Text>Adult</Text>
                            </ToggleGroup.Item>
                          </ToggleGroup>
                        </YStack>
                      </YGroup.Item>
                    </YGroup>
                  ) : (
                    <Button
                      onPress={() => setIsBreedsSheetOpen(true)}
                      iconAfter={<Plus size='$1' />}
                      width='100%'
                    >
                      Select breed
                    </Button>
                  )}

                  <Paragraph size='$2' color='$gray10'>
                    Note: You can select one breed now. You'll be able to add
                    more breeds later in your profile.
                  </Paragraph>
                </YStack>
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

          <Sheet
            modal
            open={isBreedsSheetOpen}
            onOpenChange={setIsBreedsSheetOpen}
            snapPointsMode='percent'
            snapPoints={[60]}
          >
            <Sheet.Frame>
              <Sheet.ScrollView keyboardShouldPersistTaps='handled'>
                <YStack gap='$4' padding='$4'>
                  <Input
                    value={searchText}
                    onChangeText={handleSearchTextChange}
                    placeholder='Search breeds'
                  />
                  <Separator />
                  <YStack gap='$4'>
                    {filteredBreeds.map((breed, index) => (
                      <YStack key={index}>
                        <TouchableOpacity
                          onPress={() => handleSelectBreed(breed)}
                        >
                          <Text color={colorSet.secondaryText}>
                            {breed.name}
                          </Text>
                        </TouchableOpacity>
                      </YStack>
                    ))}
                  </YStack>
                </YStack>
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
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
