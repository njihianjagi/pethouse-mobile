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
} from 'tamagui';
import {useKennelData} from '../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  CheckCircle2,
  Heart,
  Home,
  Plus,
  Scissors,
  Upload,
  X,
} from '@tamagui/lucide-icons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useTheme, useTranslations} from '../../dopebase';
import {updateUser} from '../../api/firebase/users/userClient';
import {useConfig} from '../../config';
import allBreeds from '../../assets/data/breeds_with_group.json';
import debounce from 'lodash/debounce';
import * as ImagePicker from 'expo-image-picker';
import {storageAPI} from '../../api/firebase/media';
import {Href, useRouter} from 'expo-router';
import {setUserData} from '../../redux/reducers/auth';
import {useDispatch} from 'react-redux';
import {useBreedData} from '../../api/firebase/breeds/useBreedData';

// @ts-ignore
navigator.geolocation = require('@react-native-community/geolocation');

const BreederOnboardingScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const {
    addKennel,
    updateKennel,
    getKennelByUserId,
    addKennelBreed,
    deleteKennelBreed,
    loading: kennelLoading,
    error: kennelError,
  } = useKennelData();

  const {fetchBreedByName} = useBreedData();

  const [kennelName, setKennelName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState([] as any);
  const [selectedBreed, setSelectedBreed] = useState(null as any);
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
          setSelectedBreed(kennel.breeds[0] || []);
          setBreedImages(
            kennel.breeds[0].images?.length ? kennel.breeds[0].images : []
          );
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

  const handleSelectBreed = (breed) => {
    setSelectedBreed(breed);
    setIsBreedsSheetOpen(false);
    Keyboard.dismiss();
  };

  const handleRemoveBreed = () => {
    setSelectedBreed(null);
    setBreedImages([]);
  };

  const [breedImages, setBreedImages] = useState([] as any);

  const handleSelectImage = useCallback(async () => {
    if (!selectedBreed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setBreedImages((prev) => [...prev, imageUri]);
    }
  }, [selectedBreed]);

  const handleSave = async () => {
    if (!selectedBreed) return;

    setLoading(true);
    try {
      const breedData = await fetchBreedByName(selectedBreed.name);
      if (!breedData) {
        throw new Error('Selected breed not found in the database');
      }

      const uploadedImageUrls = await Promise.all(
        breedImages.map(async (uri) => storageAPI.uploadMedia({uri}))
      );

      const kennelData = {
        name: kennelName,
        location,
        services: selectedServices,
        userId: currentUser.id || currentUser.uid,
      };

      let kennelId;
      // if (existingKennel) {
      //   await updateKennel(existingKennel.id, kennelData);
      //   kennelId = existingKennel.id;
      // } else {
      const newKennel = await addKennel(kennelData);
      kennelId = newKennel?.id;
      await updateUser(currentUser.id, {kennelId: newKennel?.id});
      // }

      // // Remove existing breed associations and add new ones
      // if (existingKennel) {
      //   await removeKennelBreed(kennelId, breedData.id!);
      // }

      await addKennelBreed(kennelId, {
        kennelId,
        breedId: breedData.id!,
        breedName: breedData.name,
        images: uploadedImageUrls.map((url) => ({
          thumbnailURL: url,
          downloadURL: url,
        })),
      });

      router.replace('/(tabs)');

      // Toast.show({
      //   title: 'Success',
      //   description: 'Breed and images saved successfully!',
      //   status: 'success',
      // });
    } catch (error) {
      // Toast.show({
      //   title: 'Error',
      //   description: 'Failed to save breed and images.',
      //   status: 'error',
      // });
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
        <ScrollView
          style={{width: '100%', height: '100%'}}
          keyboardShouldPersistTaps='always'
        >
          <YStack p='$8' gap='$6'>
            <YStack gap='$4'>
              <View style={styles?.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <Text style={styles.title}>Awesome! Let's setup your kennel</Text>
              <Text style={styles.caption}>
                Complete your profile to connect with potential buyers and
                showcase your kennel.
              </Text>
            </YStack>
            {/* 
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

              <YStack gap='$2'>
                <Text>Breeds</Text>

                <XStack gap='$2' flexWrap='wrap'>
                  {selectedBreeds.map((breed, index) => (
                    <Button
                      key={index}
                      variant='outlined'
                      paddingHorizontal='$3'
                      color={colorSet.primaryForeground}
                      borderColor={colorSet.secondaryForeground}
                      onPress={() => handleSelectBreed(breed)}
                      iconAfter={
                        <X size='$1' color={colorSet.primaryForeground} />
                      }
                    >
                      {breed.name}
                    </Button>
                  ))}
                  <Button
                    variant='outlined'
                    onPress={() => setIsBreedsSheetOpen(true)}
                    paddingHorizontal='$3'
                    iconAfter={<Plus size='$1' />}
                  >
                    {selectedBreeds.length
                      ? 'Add another breed'
                      : 'Select breed'}
                  </Button>
                </XStack>
              </YStack>
            </YStack> */}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              flexDirection='column'
              width='100%'
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
                  <Text fontFamily='$body'>Services</Text>
                </Tabs.Tab>
                <Separator vertical />
                <Tabs.Tab flex={1} value='tab3'>
                  <Text fontFamily='$body'>Breeds</Text>
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Content value='tab1'>
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
              </Tabs.Content>

              <Tabs.Content value='tab2'>
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
              </Tabs.Content>

              <Tabs.Content value='tab3'>
                <YStack gap='$2' width='100%'>
                  {selectedBreed ? (
                    <YGroup bordered separator={<Separator />}>
                      <YGroup.Item>
                        <ListItem
                          title={selectedBreed.name}
                          subTitle={`${selectedBreed.breedGroup} group`}
                          iconAfter={
                            <X size='$1' onPress={handleRemoveBreed} />
                          }
                        />
                      </YGroup.Item>
                      <YGroup.Item>
                        <XStack flexWrap='wrap' gap='$2' padding='$2'>
                          {breedImages.map((uri, index) => (
                            <Image
                              key={index}
                              source={{uri}}
                              width={100}
                              height={100}
                              borderRadius='$2'
                            />
                          ))}
                          <Button
                            onPress={handleSelectImage}
                            icon={<Upload size='$1' />}
                            width={100}
                            height={100}
                            borderRadius='$2'
                            backgroundColor='$gray5'
                          >
                            Upload
                          </Button>
                        </XStack>
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
        </ScrollView>
      )}
    </View>
  );
};

export default BreederOnboardingScreen;

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

// const ServicesSheet = ({
//   visible,
//   onClose,
//   onSelectService,
//   selectedServices,
// }) => {
//   const {theme, appearance} = useTheme();

//   const colorSet = theme?.colors[appearance];

//   const services = [
//     {id: 1, name: 'Breeding', icon: <Heart size='$1' />},
//     {id: 2, name: 'Boarding', icon: <Home size='$1' />},
//     {id: 3, name: 'Grooming', icon: <Scissors size='$1' />},
//     {id: 4, name: 'Traning', icon: <Bone size='$1' />},
//   ];

//   return (
//     <Sheet modal open={visible} onOpenChange={onClose} snapPointsMode='fit'>
//       <Sheet.Frame>
//         <Sheet.ScrollView>
//           <YStack gap='$4' padding='$4'>
//             <Text fontSize='$6' fontWeight='bold'>
//               Select Services
//             </Text>

//             {services.map((service) => (
//               <Card
//                 key={service.id}
//                 onPress={() => onSelectService(service)}
//                 padding='$4'
//                 borderRadius='$4'
//                 backgroundColor={
//                   selectedServices.includes(service)
//                     ? colorSet.background
//                     : colorSet.backgroundHover
//                 }
//                 borderColor={
//                   selectedServices.includes(service)
//                     ? colorSet.primary
//                     : colorSet.borderColor
//                 }
//                 borderWidth={2}
//               >
//                 <XStack gap='$4'>
//                   {service.icon}
//                   <Text fontSize='$6'>{service.name}</Text>
//                 </XStack>
//               </Card>
//             ))}
//           </YStack>
//         </Sheet.ScrollView>
//       </Sheet.Frame>
//       <Sheet.Overlay />
//     </Sheet>
//   );
// };
