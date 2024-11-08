import React, {useState, useEffect} from 'react';
import {useRouter} from 'expo-router';
import {ScrollView, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import {
  YStack,
  XStack,
  Input,
  Button,
  Text,
  Spinner,
  Tabs,
  ToggleGroup,
  XGroup,
  Image,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import {
  Listing,
  useListingData,
} from '../../api/firebase/listings/useListingData';
import useCurrentUser from '../../hooks/useCurrentUser';
import BreedSelector from '../../components/BreedSelector';
import ImageManager from '../../components/ImageManager';
// import VideoManager from '../../components/VideoManager';
import {
  Breed,
  UserBreed,
  useBreedData,
} from '../../api/firebase/breeds/useBreedData';
import ParallaxScrollView from '../../components/ParallaxScrollView';

const CreateListingScreen = () => {
  const router = useRouter();

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {localized} = useTranslations();
  const currentUser = useCurrentUser();
  const {addListing} = useListingData();

  const {fetchBreedByName, userBreeds, fetchUserBreeds, addUserBreed} =
    useBreedData(currentUser?.id);

  const [formData, setFormData] = useState({
    name: '',
    selectedBreed: {} as UserBreed,
    sex: '' as any,
    age: '',
    ageYears: 0,
    ageMonths: 0,
    location: '',
    price: 0,
    traits: [] as any,
    images: [] as any,
    videos: [] as any,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const isFormValid = () => {
    const {name, selectedBreed, sex, age, images} = formData;
    return name && selectedBreed.id && sex && age && images.length > 0;
  };

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');

  const tabs = ['tab1', 'tab2', 'tab3'];
  const currentIndex = tabs.indexOf(activeTab);

  useEffect(() => {
    if (formData.selectedBreed.breedName) {
      fetchBreedTraits();
    }
  }, [formData.selectedBreed]);

  const fetchBreedTraits = async () => {
    const breedData = await fetchBreedByName(formData.selectedBreed.breedName);
    if (breedData && breedData.traits) {
      handleInputChange('traits', breedData.traits);
    }
  };

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

  const handleSelectBreed = (breed: Breed) => {
    const userBreed = {
      breedName: breed.name,
      breedId: breed.id,
      breedGroup: breed.breedGroup,
      userId: currentUser.id,
      isOwner: currentUser.role === 'breeder',
    } as UserBreed;

    handleInputChange('selectedBreed', userBreed);
  };

  const isNewUserBreed = () => {
    return !userBreeds.some(
      (breed) => breed.breedId === formData.selectedBreed.breedId
    );
  };

  const handleUserBreed = async () => {
    if (isNewUserBreed()) {
      const newUserBreed: any = await addUserBreed(formData.selectedBreed);
      return newUserBreed.id;
    }

    return userBreeds.find((ub) => ub.breedId === formData.selectedBreed.id)
      ?.id;
  };

  const createListingObject = (userBreedId: string): Omit<Listing, 'id'> => ({
    userId: currentUser.id,
    userBreedId,
    breedName: formData.selectedBreed.breedName,
    breedId: formData.selectedBreed.breedId,
    name: formData.name,
    sex: formData.sex,
    ageYears: formData.ageYears,
    ageMonths: formData.ageMonths,
    age: formData.age,
    price: formData.price,
    status: 'available',
    type: currentUser.role === 'breeder' ? 'adoption' : 'wanted',
    traits: formData.traits,
    media: {
      images: formData.images,
      videos: formData.videos,
    },
    location: formData.location,
  });

  const handleCreateListing = async () => {
    if (!isFormValid()) {
      Alert.alert(
        'Error',
        'Please fill in all required fields and upload at least one image.'
      );
      return;
    }

    setLoading(true);
    try {
      const userBreedId = await handleUserBreed();
      const newListing = createListingObject(userBreedId);
      await addListing(newListing);
      Alert.alert('Success', 'Listing created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // const renderTraitOption = (traitName, traitValue) => {
  //   if (typeof traitValue === 'boolean') {
  //     return (
  //       <ListItem key={traitName}>
  //         <ListItem.Text>{traitName.replace(/_/g, ' ')}</ListItem.Text>
  //         <Switch
  //           checked={traitValue}
  //           onCheckedChange={(value) =>
  //             handleInputChange('traits', (prev) => ({
  //               ...prev,
  //               [traitName]: value,
  //             }))
  //           }
  //         >
  //           <Switch.Thumb />
  //         </Switch>
  //       </ListItem>
  //     );
  //   } else if (typeof traitValue === 'number') {
  //     return (
  //       <ListItem key={traitName}>
  //         <YStack flex={1} gap='$2'>
  //           <ListItem.Text>{traitName.replace(/_/g, ' ')}</ListItem.Text>
  //           <ToggleGroup
  //             type='single'
  //             value={traitValue.toString() as string}
  //             onValueChange={(value) =>
  //               handleInputChange('traits', (prev) => ({
  //                 ...prev,
  //                 [traitName]: parseInt(value),
  //               }))
  //             }
  //           >
  //             {[1, 2, 3, 4, 5].map((value) => (
  //               <ToggleGroup.Item
  //                 key={value}
  //                 value={value.toString() as string}
  //                 flex={1}
  //               >
  //                 <Text>{value}</Text>
  //               </ToggleGroup.Item>
  //             ))}
  //           </ToggleGroup>
  //         </YStack>
  //       </ListItem>
  //     );
  //   }
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ParallaxScrollView
        headerImage={
          <Image
            objectFit='cover'
            src={require('../../assets/images/doggo_2.png')}
          />
        }
        headerBackgroundColor={colorSet.secondaryForeground}
      >
        <YStack padding='$4' gap='$4'>
          <YStack gap='$4'>
            <YStack gap='$2'>
              <Text>{localized('Breed')}</Text>
              <BreedSelector
                onSelectBreed={handleSelectBreed}
                userBreeds={userBreeds}
                buttonText={
                  formData.selectedBreed.breedName || localized('Select Breed')
                }
              />
              {formData.selectedBreed?.id && isNewUserBreed() && (
                <Text color='$green10'>
                  {localized(
                    'This breed will be added to your kennel when the listing is created.'
                  )}
                </Text>
              )}
            </YStack>

            <YStack gap='$2'>
              <Text>
                {currentUser.role === 'seeker'
                  ? localized('Preferred Sex')
                  : localized('Sex')}
              </Text>

              <ToggleGroup
                type='single'
                value={formData.sex}
                onValueChange={(value) => handleInputChange('sex', value)}
              >
                <ToggleGroup.Item value='male' flex={1}>
                  <Text>{localized('Male')}</Text>
                </ToggleGroup.Item>
                <ToggleGroup.Item value='female' flex={1}>
                  <Text>{localized('Female')}</Text>
                </ToggleGroup.Item>

                {currentUser.role === 'seeker' && (
                  <ToggleGroup.Item value='no-preference' flex={1}>
                    <Text>{localized('Any')}</Text>
                  </ToggleGroup.Item>
                )}
              </ToggleGroup>
            </YStack>

            <YStack gap='$2'>
              <Text>
                {currentUser.role === 'breeder'
                  ? localized('Age')
                  : localized('Preferred Age')}
              </Text>

              {currentUser.role === 'breeder' ? (
                <XStack alignItems='center'>
                  <XGroup flex={1}>
                    <XGroup.Item>
                      <Input
                        keyboardType='numeric'
                        value={formData.ageYears.toString()}
                        onChangeText={(value) =>
                          handleInputChange('ageYears', value)
                        }
                        placeholder={localized('Years')}
                      />
                    </XGroup.Item>

                    <XGroup.Item>
                      <Button theme='active'>{localized('Years')}</Button>
                    </XGroup.Item>
                  </XGroup>

                  <XGroup flex={1}>
                    <XGroup.Item>
                      <Input
                        keyboardType='numeric'
                        value={formData.ageMonths.toString()}
                        onChangeText={(value) =>
                          handleInputChange('ageMonths', value)
                        }
                        placeholder={localized('Months')}
                      />
                    </XGroup.Item>
                    <XGroup.Item>
                      <Button theme='active'>{localized('Months')}</Button>
                    </XGroup.Item>
                  </XGroup>
                </XStack>
              ) : (
                <ToggleGroup
                  type='single'
                  value={formData.age}
                  onValueChange={(value) => handleInputChange('age', value)}
                >
                  <ToggleGroup.Item value='puppy' flex={1}>
                    <Text>{localized('Puppy')}</Text>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value='young' flex={1}>
                    <Text>{localized('Young')}</Text>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value='adult' flex={1}>
                    <Text>{localized('Adult')}</Text>
                  </ToggleGroup.Item>
                </ToggleGroup>
              )}
            </YStack>

            {currentUser.role === 'breeder' && (
              <YStack gap='$2'>
                <Text>{localized('Photos')}</Text>

                <ImageManager
                  images={formData.images}
                  onAddImage={(newImage) =>
                    handleInputChange('images', [...formData.images, newImage])
                  }
                  onRemoveImage={(index) =>
                    handleInputChange(
                      'images',
                      formData.images.filter((_, i) => i !== index)
                    )
                  }
                />
              </YStack>
            )}

            <Button
              theme='active'
              onPress={handleCreateListing}
              disabled={loading}
              iconAfter={loading ? <Spinner /> : null}
            >
              {loading ? '' : 'Create Listing'}
            </Button>
          </YStack>
        </YStack>
      </ParallaxScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateListingScreen;
