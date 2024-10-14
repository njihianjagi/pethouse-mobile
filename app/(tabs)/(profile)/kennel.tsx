import React, {useState, useEffect, useCallback} from 'react';
import {Keyboard, StyleSheet, TouchableOpacity} from 'react-native';
import {
  View,
  YStack,
  Input,
  Button,
  Text,
  Image,
  Sheet,
  Separator,
  XStack,
  ScrollView,
  Label,
  Spinner,
  Tabs,
  Circle,
  ListItem,
  YGroup,
  Paragraph,
  Accordion,
  Square,
} from 'tamagui';
import {useKennelData} from '../../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Plus,
  Scissors,
  Trash,
  Upload,
  X,
} from '@tamagui/lucide-icons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useTheme, useTranslations} from '../../../dopebase';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useConfig} from '../../../config';
import allBreeds from '../../../assets/data/breeds_with_group.json';
import debounce from 'lodash/debounce';
import * as ImagePicker from 'expo-image-picker';
import {storageAPI} from '../../../api/firebase/media';
import {useRouter} from 'expo-router';
import {setUserData} from '../../../redux/reducers/auth';
import {useDispatch} from 'react-redux';

// @ts-ignore
navigator.geolocation = require('@react-native-community/geolocation');

const ManageKennelScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const {
    addKennel,
    updateKennel,
    getKennelByUserId,
    loading: kennelLoading,
    error,
  } = useKennelData();

  const [kennelName, setKennelName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState([] as any);
  const [selectedBreeds, setSelectedBreeds] = useState([] as any[]);
  const [existingKennel, setExistingKennel] = useState(null as any);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [isBreedsSheetOpen, setIsBreedsSheetOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('tab1');

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

  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  const config = useConfig();

  const {localized} = useTranslations();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      getKennelByUserId(currentUser.id || currentUser.uid).then((kennel) => {
        if (kennel) {
          setExistingKennel(kennel);
          setKennelName(kennel.name);
          setLocation(kennel.location);
          setSelectedServices(kennel.services || []);
          setSelectedBreeds(kennel.breeds || []);
          // setBreedImages(
          //   kennel.breeds[0].images?.length ? kennel.breeds[0].images : []
          // );
        }
      });
    }
  }, [currentUser?.id]);

  const services = [
    {name: 'Breeding', subtitle: 'Responsible breeding programs', icon: Heart},
    {name: 'Boarding', subtitle: 'Short-term care for dogs', icon: Home},
    {
      name: 'Grooming',
      subtitle: 'Professional grooming services',
      icon: Scissors,
    },
  ];

  const handleSelectService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
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

  // Ensure the debounced function is cleaned up on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search text change
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleAddBreed = (breed) => {
    setSelectedBreeds((prev) => [...prev, {name: breed.name, images: []}]);
    setIsBreedsSheetOpen(false);
    Keyboard.dismiss();
  };

  const handleRemoveBreed = (breedName) => {
    setSelectedBreeds((prev) =>
      prev.filter((breed) => breed.name !== breedName)
    );
  };

  const handleSelectImage = useCallback(async (breedName) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedBreeds((prev) =>
        prev.map((breed) =>
          breed.name === breedName
            ? {
                ...breed,
                images: [
                  ...breed.images,
                  {downloadURL: imageUri, thumbnailURL: imageUri},
                ],
              }
            : breed
        )
      );
    }
  }, []);

  const handleRemoveImage = useCallback((breedName, imageIndex) => {
    setSelectedBreeds((prev) =>
      prev.map((breed) =>
        breed.name === breedName
          ? {
              ...breed,
              images: breed.images.filter((_, index) => index !== imageIndex),
            }
          : breed
      )
    );
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const uploadedBreeds = await Promise.all(
        selectedBreeds.map(async (breed) => {
          const uploadedImages = await Promise.all(
            breed.images.map(async (image) => {
              if (image.downloadURL.startsWith('file://')) {
                const uploadedImageUrl = await storageAPI.uploadMedia({
                  uri: image.downloadURL,
                });
                return {
                  downloadURL: uploadedImageUrl,
                  thumbnailURL: uploadedImageUrl,
                };
              }
              return image;
            })
          );
          return {...breed, images: uploadedImages};
        })
      );

      const kennelData = {
        name: kennelName,
        location,
        services: selectedServices,
        breeds: uploadedBreeds,
        userId: currentUser.id || currentUser.uid,
      };

      await updateKennel(existingKennel.id, {
        ...existingKennel,
        ...kennelData,
      });

      router.replace('(tabs)');
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      {kennelLoading ? (
        <Spinner
          size='large'
          color={theme.colors[appearance].primaryForeground}
        />
      ) : (
        <View>
          <ScrollView keyboardShouldPersistTaps='always'>
            <YStack p='$4' gap='$4' paddingBottom='$12'>
              <YGroup>
                <YGroup.Item>
                  <ListItem
                    title='Details'
                    subTitle='Basic information about your kennel'
                  />
                </YGroup.Item>
                <Separator />
                <YGroup.Item>
                  <ListItem>
                    <YStack>
                      <YStack gap='$0'>
                        <Label htmlFor='name'>Kennel Name</Label>
                        <Input
                          placeholder='Kennel Name'
                          value={kennelName}
                          onChangeText={setKennelName}
                          flex={1}
                          width='100%'
                        />
                      </YStack>

                      <YStack gap='$0'>
                        <Label htmlFor='location'>Kennel Location</Label>
                        <Input
                          placeholder='Kennel Location'
                          value={location}
                          onFocus={() => setIsLocationSheetOpen(true)}
                          onChangeText={setLocation}
                          onPress={Keyboard.dismiss}
                          flex={1}
                        />
                      </YStack>
                    </YStack>
                  </ListItem>
                </YGroup.Item>
              </YGroup>

              {/* <YGroup bordered separator={<Separator />}>
                <YGroup.Item>
                  <ListItem
                    title='Services'
                    subTitle='What services do you offer?'
                  />
                </YGroup.Item>
                {services.map((service) => (
                  <YGroup.Item key={service.name}>
                    <ListItem
                      title={service.name}
                      subTitle={service.subtitle}
                      icon={service.icon}
                      pressTheme
                      color={
                        selectedServices.includes(service.name)
                          ? colorSet.primaryForeground
                          : undefined
                      }
                      onPress={() => handleSelectService(service.name)}
                      iconAfter={
                        selectedServices.includes(service.name) ? (
                          <CheckCircle2
                            size='$1'
                            color={colorSet.primaryForeground}
                          />
                        ) : (
                          <Circle size='$1' />
                        )
                      }
                    ></ListItem>
                  </YGroup.Item>
                ))}
              </YGroup> */}

              <YGroup width='100%'>
                <YGroup.Item>
                  <ListItem
                    title='Breeds'
                    subTitle='What breeds do you specialize in?'
                    onPress={() => setIsBreedsSheetOpen(true)}
                    iconAfter={<Plus size='$1' />}
                  />
                </YGroup.Item>
                <Separator />

                <YGroup.Item>
                  <YGroup separator={<Separator />}>
                    {selectedBreeds.map((breed, index) => (
                      <YGroup.Item key={index}>
                        <ListItem
                          title={breed.name}
                          subTitle={breed.breedGroup}
                          iconAfter={
                            <Trash
                              onPress={() => handleRemoveBreed(breed.name)}
                            />
                          }
                        ></ListItem>

                        <ListItem>
                          <XStack>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                            >
                              <XStack gap='$2' p='$2'>
                                {breed.images.map((image, imgIndex) => (
                                  <XStack key={imgIndex}>
                                    <Image
                                      source={{uri: image.downloadURL}}
                                      width={100}
                                      height={100}
                                      borderRadius='$2'
                                    />
                                    <Button
                                      onPress={() =>
                                        handleRemoveImage(breed.name, imgIndex)
                                      }
                                      icon={<Trash size='$1' />}
                                      size='$2'
                                      circular
                                      position='absolute'
                                      top={0}
                                      right={0}
                                    />
                                  </XStack>
                                ))}
                                <Button
                                  onPress={() => handleSelectImage(breed.name)}
                                  icon={<Upload size='$1' />}
                                  width={100}
                                  height={100}
                                  borderRadius='$2'
                                  backgroundColor='$gray5'
                                ></Button>
                              </XStack>
                            </ScrollView>
                          </XStack>
                        </ListItem>
                      </YGroup.Item>
                    ))}
                  </YGroup>
                </YGroup.Item>
              </YGroup>
            </YStack>
          </ScrollView>

          <YStack
            position='absolute'
            bottom={0}
            left={0}
            right={0}
            padding='$4'
            backgroundColor={colorSet.primaryBackground}
            borderBottomWidth={1}
            borderBottomColor={colorSet.secondaryBackground}
          >
            <Button
              onPress={handleSave}
              backgroundColor={colorSet.primaryForeground}
              color={colorSet.primaryBackground}
              size='$4'
              disabled={loading}
              iconAfter={loading ? <Spinner /> : null}
            >
              {loading ? '' : 'Save'}
            </Button>
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
                        <TouchableOpacity onPress={() => handleAddBreed(breed)}>
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
        </View>
      )}
    </View>
  );
};

export default ManageKennelScreen;

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
