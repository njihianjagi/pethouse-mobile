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
  Separator,
  Select,
  Switch,
  ToggleGroup,
  ListItem,
  YGroup,
  View,
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
import {DogBreed, useBreedData} from '../../api/firebase/breeds/useBreedData';
import useKennelData, {
  KennelBreed,
} from '../../api/firebase/kennels/useKennelData';

const CreateListingScreen = () => {
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();
  const {addListing} = useListingData();
  const {fetchBreedByName} = useBreedData();
  const colorSet = theme.colors[appearance];

  const [formData, setFormData] = useState({
    name: '',
    selectedBreed: {} as DogBreed,
    sex: '' as any,
    age: '',
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
  const {kennelBreeds, fetchKennelBreeds, addKennelBreed} = useKennelData();

  const tabs = ['tab1', 'tab2', 'tab3'];
  const currentIndex = tabs.indexOf(activeTab);

  useEffect(() => {
    if (currentUser.kennelId) {
      fetchKennelBreeds(currentUser.kennelId);
    }
  }, [currentUser.kennelId]);

  useEffect(() => {
    if (formData.selectedBreed.name) {
      fetchBreedTraits();
    }
  }, [formData.selectedBreed]);

  const fetchBreedTraits = async () => {
    const breedData = await fetchBreedByName(formData.selectedBreed.name);
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

  const handleSelectBreed = (breed: DogBreed) => {
    handleInputChange('selectedBreed', breed);
  };

  const isNewKennelBreed = () => {
    return !kennelBreeds.some(
      (breed) => breed.breedId === formData.selectedBreed.id
    );
  };

  const handleKennelBreed = async () => {
    if (isNewKennelBreed()) {
      const newKennelBreed: any = await addKennelBreed({
        kennelId: currentUser.kennelId,
        breedId: formData.selectedBreed.id!,
        breedName: formData.selectedBreed.name,
        breedGroup: formData.selectedBreed.breedGroup,
      });
      return newKennelBreed.id;
    }
    return kennelBreeds.find((kb) => kb.breedId === formData.selectedBreed.id)
      ?.id;
  };

  const createListingObject = (kennelBreedId: string): Omit<Listing, 'id'> => ({
    userId: currentUser.id,
    kennelId: currentUser.kennelId,
    kennelBreedId,
    ...formData,
    breed: formData.selectedBreed.name,
    breedId: formData.selectedBreed.id,
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
      const kennelBreedId = await handleKennelBreed();
      const newListing = createListingObject(kennelBreedId);
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
  const renderTraitOption = (traitName, traitValue) => {
    if (typeof traitValue === 'boolean') {
      return (
        <ListItem key={traitName}>
          <ListItem.Text>{traitName.replace(/_/g, ' ')}</ListItem.Text>
          <Switch
            checked={traitValue}
            onCheckedChange={(value) =>
              handleInputChange('traits', (prev) => ({
                ...prev,
                [traitName]: value,
              }))
            }
          >
            <Switch.Thumb />
          </Switch>
        </ListItem>
      );
    } else if (typeof traitValue === 'number') {
      return (
        <ListItem key={traitName}>
          <YStack flex={1} gap='$2'>
            <ListItem.Text>{traitName.replace(/_/g, ' ')}</ListItem.Text>
            <ToggleGroup
              type='single'
              value={traitValue.toString() as string}
              onValueChange={(value) =>
                handleInputChange('traits', (prev) => ({
                  ...prev,
                  [traitName]: parseInt(value),
                }))
              }
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <ToggleGroup.Item key={value} value={value.toString()} flex={1}>
                  <Text>{value}</Text>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </YStack>
        </ListItem>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScrollView>
        <YStack padding='$4' gap='$4'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            flexDirection='column'
            width='100%'
          >
            <Tabs.List paddingBottom='$4'>
              <Tabs.Tab value='tab1' flex={1}>
                <Text>{localized('Basic Info')}</Text>
              </Tabs.Tab>
              <Tabs.Tab value='tab2' flex={1}>
                <Text>{localized('Traits')}</Text>
              </Tabs.Tab>
              <Tabs.Tab value='tab3' flex={1}>
                <Text>{localized('Media')}</Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Content value='tab1'>
              <YStack gap='$4'>
                <YStack gap='$2'>
                  <Text>{localized('Pet Name')}</Text>
                  <Input
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder={localized('Enter pet name')}
                  />
                </YStack>

                <YStack gap='$2'>
                  <Text>{localized('Breed')}</Text>
                  <BreedSelector
                    onSelectBreed={handleSelectBreed}
                    kennelBreeds={kennelBreeds}
                    buttonText={
                      formData.selectedBreed.name || localized('Select Breed')
                    }
                  />
                  {formData.selectedBreed?.id && isNewKennelBreed() && (
                    <Text color='$green10'>
                      {localized(
                        'This breed will be added to your kennel when the listing is created.'
                      )}
                    </Text>
                  )}
                </YStack>

                <YStack gap='$2'>
                  <Text>{localized('Sex')}</Text>
                  <ToggleGroup
                    type='single'
                    value={formData.sex}
                    onValueChange={(value) => handleInputChange('sex', value)}
                  >
                    <ToggleGroup.Item value='male'>
                      <Text>{localized('Male')}</Text>
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value='female'>
                      <Text>{localized('Female')}</Text>
                    </ToggleGroup.Item>
                  </ToggleGroup>
                </YStack>

                <YStack gap='$2'>
                  <Text>{localized('Age')}</Text>
                  <Input
                    value={formData.age}
                    onChangeText={(value) => handleInputChange('age', value)}
                    placeholder={localized('Enter age')}
                  />
                </YStack>
              </YStack>
            </Tabs.Content>

            <Tabs.Content value='tab2'>
              <YStack gap='$4'>
                {formData.selectedBreed &&
                  formData.selectedBreed.traits &&
                  Object.entries(formData.selectedBreed.traits).map(
                    ([traitName, traitValue]) =>
                      renderTraitOption(traitName, traitValue)
                  )}
              </YStack>
            </Tabs.Content>

            <Tabs.Content value='tab3'>
              <YStack gap='$4'>
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
                {/* <VideoManager
                  videos={videos}
                  onAddVideo={(newVideo) => setVideos([...videos, newVideo])}
                  onRemoveVideo={(index) => setVideos(videos.filter((_, i) => i !== index))}
                /> */}
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

            {currentIndex === tabs.length - 1 && (
              <Button
                onPress={handleCreateListing}
                disabled={loading}
                iconAfter={loading ? <Spinner /> : null}
              >
                {loading ? '' : 'Create Listing'}
              </Button>
            )}
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateListingScreen;
