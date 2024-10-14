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
  Heart,
  Home,
  Plus,
  Scissors,
  Upload,
  X,
} from '@tamagui/lucide-icons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useTheme, useTranslations} from '../../../dopebase';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useConfig} from '../../../config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
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
          console.log(kennel);
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

  const [breedImages, setBreedImages] = useState([] as any);

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
            ? {...breed, images: [...breed.images, imageUri]}
            : breed
        )
      );
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const uploadedBreeds = await Promise.all(
        selectedBreeds.map(async (breed) => {
          const uploadedImageUrls = await Promise.all(
            breed.images.map(async (uri) => storageAPI.uploadMedia({uri}))
          );
          return {name: breed.name, images: uploadedImageUrls};
        })
      );

      const kennelData = {
        name: kennelName,
        location,
        services: selectedServices,
        breeds: uploadedBreeds,
        userId: currentUser.id || currentUser.uid,
      };

      if (existingKennel) {
        await updateKennel(existingKennel.id, {
          ...existingKennel,
          ...kennelData,
        });
      } else {
        const newKennel: any = await addKennel(kennelData);
        const response: any = await updateUser(currentUser.id, {
          kennelId: newKennel.id,
        });
        await dispatch(
          setUserData({
            user: response.user,
          })
        );
      }

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
        <KeyboardAwareScrollView
          style={{width: '100%', height: '100%'}}
          keyboardShouldPersistTaps='always'
        >
          <YStack p='$8' gap='$6'>
            <YStack gap='$2'>
              <YStack gap='$0'>
                <Label htmlFor='name'>Kennel Name</Label>
                <Input
                  placeholder='Kennel Name'
                  value={kennelName}
                  onChangeText={setKennelName}
                />
              </YStack>

              <YStack gap='$0' paddingBottom='$2'>
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

            <YStack>
              <YGroup bordered separator={<Separator />}>
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
              </YGroup>
            </YStack>

            <YStack gap='$2' width='100%'>
              <Accordion type='multiple' width='100%'>
                {selectedBreeds.map((breed, index) => (
                  <Accordion.Item value={breed.name} key={index}>
                    <Accordion.Trigger
                      flexDirection='row'
                      justifyContent='space-between'
                    >
                      {({open}) => (
                        <>
                          <Paragraph>{breed.name}</Paragraph>
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
                      <XStack flexWrap='wrap' gap='$2' padding='$2'>
                        {/* {breed.images.map((uri, imgIndex) => (
                          <Image
                            key={imgIndex}
                            source={{uri}}
                            width={100}
                            height={100}
                            borderRadius='$2'
                          />
                        ))} */}
                        <Button
                          onPress={() => handleSelectImage(breed.name)}
                          icon={<Upload size='$1' />}
                          width={100}
                          height={100}
                          borderRadius='$2'
                          backgroundColor='$gray5'
                        >
                          Upload
                        </Button>
                      </XStack>
                      <Button onPress={() => handleRemoveBreed(breed.name)}>
                        Remove Breed
                      </Button>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
              <Button
                onPress={() => setIsBreedsSheetOpen(true)}
                iconAfter={<Plus size='$1' />}
                width='100%'
              >
                Add breed
              </Button>
            </YStack>

            <XStack justifyContent='space-between' padding='$2'>
              <Button
                onPress={handleSave}
                disabled={loading}
                iconAfter={loading ? <Spinner /> : null}
              >
                {loading ? '' : 'Save'}
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
        </KeyboardAwareScrollView>
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
