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
  YGroup,
  ListItem,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import BreedSelector from '../../components/BreedSelector';
import useBreedData, {DogBreed} from '../../api/firebase/breeds/useBreedData';
import useKennelData from '../../api/firebase/kennels/useKennelData';
import {Minus} from '@tamagui/lucide-icons';
import {updateUser} from '../../api/firebase/users/userClient';

const BreederOnboardingScreen = () => {
  const router = useRouter();
  const {theme} = useTheme();
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();

  const {addUserBreed} = useBreedData(currentUser?.id);
  const {addKennel} = useKennelData();

  const [formData, setFormData] = useState({
    kennelName: '',
    description: '',
    location: '',
    selectedBreeds: [] as DogBreed[],
    hasKennel: false,
  });
  const [activeTab, setActiveTab] = useState('tab1');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSelectBreed = (breed: DogBreed) => {
    setFormData((prev) => ({
      ...prev,
      selectedBreeds: [...prev.selectedBreeds, breed],
    }));
  };

  const handleRemoveBreed = (breedId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedBreeds: prev.selectedBreeds.filter(
        (breed) => breed.id !== breedId
      ),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let kennelId;
      if (formData.hasKennel) {
        const kennel: any = await addKennel({
          name: formData.kennelName,
          location: formData.location,
          userId: currentUser.id,
        });
        kennelId = kennel.id;
      }

      const userBreeds = await Promise.all(
        formData.selectedBreeds.map((breed) =>
          addUserBreed({
            userId: currentUser.id,
            breedId: breed.id,
            breedName: breed.name,
            breedGroup: breed.breedGroup,
            isOwner: true,
            kennelId: kennelId,
          })
        )
      );

      await updateUser(currentUser.id, {
        isBreeder: true,
        kennelId: kennelId,
      });

      updateUser(currentUser.id, {isBreeder: true, kennelId: kennelId});
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save breeder information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScrollView>
        <YStack padding='$4' space='$4'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value='tab1'>
                <Text>{localized('Kennel Info')}</Text>
              </Tabs.Tab>
              <Tabs.Tab value='tab2'>
                <Text>{localized('Breeds')}</Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Content value='tab1'>
              <YStack space='$4'>
                <Input
                  placeholder={localized('Kennel Name')}
                  value={formData.kennelName}
                  onChangeText={(value) =>
                    handleInputChange('kennelName', value)
                  }
                />
                <Input
                  placeholder={localized('Description')}
                  value={formData.description}
                  onChangeText={(value) =>
                    handleInputChange('description', value)
                  }
                  multiline
                />
                <Input
                  placeholder={localized('Location')}
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                />
              </YStack>
            </Tabs.Content>

            <Tabs.Content value='tab2'>
              <YStack gap='$4'>
                <BreedSelector
                  onSelectBreed={handleSelectBreed}
                  buttonText={localized('Add Breed')}
                />
                <YGroup>
                  {formData.selectedBreeds.map((breed) => (
                    <YGroup.Item key={breed.id}>
                      <ListItem
                        title={breed.name}
                        subTitle={breed.breedGroup}
                        onPress={() => handleRemoveBreed(breed.id!)}
                        icon={Minus}
                      />
                    </YGroup.Item>
                  ))}
                </YGroup>
              </YStack>
            </Tabs.Content>
          </Tabs>

          <Button onPress={handleSave} disabled={loading}>
            {loading ? <Spinner /> : localized('Save')}
          </Button>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BreederOnboardingScreen;
