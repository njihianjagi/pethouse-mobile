import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {ScrollView, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import {
  YStack,
  XStack,
  Input,
  Button,
  Text,
  TextArea,
  Spinner,
  Tabs,
  Separator,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import {useListingData} from '../../api/firebase/listings/useListingsData';
import useCurrentUser from '../../hooks/useCurrentUser';
import BreedSelector from '../../components/BreedSelector';
import ImageManager from '../../components/ImageManager';

const CreateListingScreen = () => {
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();
  const {addListing} = useListingData();
  const colorSet = theme.colors[appearance];

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBreed, setSelectedBreed] = useState({id: '', name: ''});
  const [images, setImages] = useState([] as any);
  const [loading, setLoading] = useState(false);
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

  const handleCreateListing = async () => {
    if (
      !name ||
      !age ||
      !description ||
      !selectedBreed.id ||
      images.length === 0
    ) {
      Alert.alert(
        'Error',
        'Please fill in all fields and upload at least one image.'
      );
      return;
    }

    setLoading(true);
    try {
      const newListing = {
        userId: currentUser.id,
        kennelBreedId: selectedBreed.id,
        name,
        breed: selectedBreed.name,
        age,
        location: currentUser.location || '',
        description,
        images,
      };

      await addListing(newListing);
      Alert.alert('Success', 'Listing created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBreed = (breedId: string, breedName: string) => {
    setSelectedBreed({id: breedId, name: breedName});
  };

  const handleAddImage = (newImage) => {
    setImages([...images, newImage]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScrollView>
        <YStack padding='$4' space='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Create New Listing')}
          </Text>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            flexDirection='column'
            width='100%'
          >
            <Tabs.List
              disablePassBorderRadius='bottom'
              aria-label='Create listing'
              marginBottom='$4'
              borderColor={colorSet.primaryForeground}
            >
              <Tabs.Tab flex={1} value='tab1'>
                <Text fontFamily='$body'>Basic Info</Text>
              </Tabs.Tab>
              <Separator vertical />
              <Tabs.Tab flex={1} value='tab2'>
                <Text fontFamily='$body'>Details</Text>
              </Tabs.Tab>
              <Separator vertical />
              <Tabs.Tab flex={1} value='tab3'>
                <Text fontFamily='$body'>Images</Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Content value='tab1'>
              <YStack space='$4'>
                <Input
                  placeholder={localized('Pet Name')}
                  value={name}
                  onChangeText={setName}
                />
                <BreedSelector
                  onSelectBreed={handleSelectBreed}
                  buttonText={selectedBreed.name || 'Select Breed'}
                />
                <Input
                  placeholder={localized('Age')}
                  value={age}
                  onChangeText={setAge}
                />
              </YStack>
            </Tabs.Content>

            <Tabs.Content value='tab2'>
              <YStack space='$4'>
                <TextArea
                  placeholder={localized('Description')}
                  value={description}
                  onChangeText={setDescription}
                  minHeight={150}
                />
              </YStack>
            </Tabs.Content>

            <Tabs.Content value='tab3'>
              <YStack space='$4'>
                <ImageManager
                  images={images}
                  onAddImage={handleAddImage}
                  onRemoveImage={handleRemoveImage}
                />
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
