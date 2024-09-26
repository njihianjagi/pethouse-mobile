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
} from 'tamagui';
import {useKennelData} from '../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../hooks/useCurrentUser';
import {Plus, X} from '@tamagui/lucide-icons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {ActivityIndicator, useTheme, useTranslations} from '../../dopebase';
import {updateUser} from '../../api/firebase/users/userClient';
import {useConfig} from '../../config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import allBreeds from '../../assets/data/breeds_with_group.json';
import debounce from 'lodash/debounce';

// @ts-ignore
navigator.geolocation = require('@react-native-community/geolocation');

const BreederProfileScreen = () => {
  const currentUser = useCurrentUser();
  const {
    addKennel,
    updateKennel,
    getKennelByUserId,
    loading: kennelLoading,
  } = useKennelData();

  const [kennelName, setKennelName] = useState('');
  const [location, setLocation] = useState('');

  const [selectedServices, setSelectedServices] = useState([] as any);
  const [selectedBreeds, setSelectedBreeds] = useState([] as any);
  const [existingKennel, setExistingKennel] = useState(null as any);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [isBreedsSheetOpen, setIsBreedsSheetOpen] = useState(false);

  const [inputErrors, setInputErrors] = useState({} as any);

  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  const config = useConfig();

  const {localized} = useTranslations();

  useEffect(() => {
    if (currentUser) {
      getKennelByUserId(currentUser.id).then((kennel) => {
        if (kennel) {
          console.log('kennel', kennel);
          setExistingKennel(kennel);
          setKennelName(kennel.name);
          setLocation(kennel.location);
          setSelectedServices(kennel.services || []);
          setSelectedBreeds(kennel.breeds || []);
        }
      });
    }
  }, [currentUser?.id]);

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
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter((b) => b !== breed));
    } else {
      setSelectedBreeds([...selectedBreeds, breed]);
    }
    setIsBreedsSheetOpen(false);
    Keyboard.dismiss();
  };

  const handleSave = async () => {
    const kennelData = {
      name: kennelName,
      location,
      services: selectedServices,
      breeds: selectedBreeds,
      userId: currentUser.id,
    };

    if (existingKennel) {
      await updateKennel(existingKennel.id, kennelData);
    } else {
      const newKennelId = await addKennel(kennelData);
      await updateUser(currentUser.id, {kennelId: newKennelId});
    }

    // Navigate to the next screen or dashboard
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
            <YStack gap='$4'>
              <View style={styles?.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <Text style={styles.title}>Awesome! Let's setup your kennel</Text>
              {/* <Text style={styles.caption}>
              Complete your profile to connect with potential buyers and
              showcase your kennel.
            </Text> */}
            </YStack>

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
            </YStack>

            <Button
              onPress={handleSave}
              theme='active'
              backgroundColor={colorSet.secondaryForeground}
              color={colorSet.primaryForeground}
            >
              {existingKennel
                ? localized('Update Kennel')
                : localized('Create Kennel')}
            </Button>
          </YStack>

          <Sheet
            open={isLocationSheetOpen}
            onOpenChange={setIsLocationSheetOpen}
            snapPointsMode='percent'
            snapPoints={[50]}
          >
            <Sheet.Overlay />
            <Sheet.Frame padding='$4'>
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

export default BreederProfileScreen;

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
