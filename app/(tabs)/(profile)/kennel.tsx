import React, {useState, useEffect} from 'react';
import {ScrollView, Alert} from 'react-native';
import {
  View,
  YStack,
  Input,
  Button,
  Text,
  Sheet,
  Separator,
  XStack,
  Spinner,
  ListItem,
  YGroup,
  Tabs,
  Card,
} from 'tamagui';
import {
  Kennel,
  KennelBreed,
  useKennelData,
} from '../../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {
  Heart,
  Home,
  Plus,
  Scissors,
  Trash,
  ArrowRight,
} from '@tamagui/lucide-icons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useTheme, useTranslations} from '../../../dopebase';
import {useConfig} from '../../../config';
import BreedSelector from '../../../components/BreedSelector';
import {
  Listing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import {
  Litter,
  useLitterData,
} from '../../../api/firebase/litters/useLitterData';
import {useRouter} from 'expo-router';

const ManageKennelScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const config = useConfig();
  const {localized} = useTranslations();

  const {
    kennelBreeds,
    updateKennel,
    getKennelByUserId,
    fetchKennelBreeds,
    deleteKennelBreed,
    loading: kennelLoading,
  } = useKennelData();

  const {fetchListingsByKennelId} = useListingData();
  const {fetchLittersByKennelId} = useLitterData();

  const [formData, setFormData] = useState({
    kennelName: '',
    location: '',
    selectedServices: [] as any,
  });
  const [loading, setLoading] = useState(false);
  const [existingKennel, setExistingKennel] = useState({} as Kennel);

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchKennelData = async () => {
      if (currentUser) {
        const kennel = await getKennelByUserId(
          currentUser.id || currentUser.uid
        );
        if (kennel) {
          setExistingKennel(kennel);
          setFormData({
            kennelName: kennel.name,
            location: kennel.location,
            selectedServices: kennel.services || [],
          });
        }
      }
    };

    fetchKennelData();
  }, [currentUser.id]);

  const services = [
    {name: 'Breeding', subtitle: 'Responsible breeding programs', icon: Heart},
    {name: 'Boarding', subtitle: 'Short-term care for dogs', icon: Home},
    {
      name: 'Grooming',
      subtitle: 'Professional grooming services',
      icon: Scissors,
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSelectService = (service) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }));
  };

  const handleSave = async () => {
    if (!formData.kennelName) {
      Alert.alert('Error', 'Please fill in the kennel name.');
      return;
    }

    setLoading(true);
    try {
      await updateKennel(existingKennel.id, {
        name: formData.kennelName,
        location: formData.location,
        // services: formData.selectedServices,
      });
      Alert.alert('Success', 'Kennel information updated successfully');
    } catch (error) {
      console.error('Error updating kennel:', error);
      Alert.alert(
        'Error',
        'Failed to update kennel information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View flex={1} backgroundColor={colorSet.primaryBackground}>
      <ScrollView>
        <YStack padding='$4' gap='$4'>
          <YStack gap='$4' marginTop='$4'>
            <Input
              placeholder={localized('Kennel Name')}
              value={formData.kennelName}
              onChangeText={(value) => handleInputChange('kennelName', value)}
            />
            <Input
              placeholder={localized('Location')}
              value={formData.location}
              onPressIn={() => setIsLocationSheetOpen(true)}
            />
            <Text>{localized('Services')}</Text>

            <YGroup separator={<Separator />}>
              {services.map((service, index) => (
                <YGroup.Item key={index}>
                  <ListItem
                    title={service.name}
                    subTitle={service.subtitle}
                    icon={service.icon}
                    iconAfter={
                      formData.selectedServices.includes(service.name) ? (
                        <Button
                          icon={Trash}
                          size='$2'
                          circular
                          onPress={() => handleSelectService(service.name)}
                        />
                      ) : (
                        <Button
                          icon={Plus}
                          size='$2'
                          circular
                          onPress={() => handleSelectService(service.name)}
                        />
                      )
                    }
                  />
                </YGroup.Item>
              ))}
            </YGroup>
          </YStack>
        </YStack>
      </ScrollView>
      <YStack
        position='absolute'
        bottom={0}
        left={0}
        right={0}
        padding='$4'
        backgroundColor={colorSet.primaryBackground}
        borderTopWidth={1}
        borderTopColor={colorSet.secondaryBackground}
      >
        <Button
          onPress={handleSave}
          backgroundColor={colorSet.primaryForeground}
          color={colorSet.primaryBackground}
          size='$4'
          disabled={loading}
          iconAfter={loading ? <Spinner /> : null}
        >
          {loading ? '' : localized('Save')}
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
            contentContainerStyle={{flex: 1}}
            keyboardShouldPersistTaps='handled'
            horizontal={true}
          >
            <GooglePlacesAutocomplete
              placeholder={localized('Search for a location')}
              onPress={(data, details = null) => {
                handleInputChange('location', data.description);
                setIsLocationSheetOpen(false);
              }}
              query={{
                key: config.googleMapsApiKey,
                language: 'en',
              }}
              textInputProps={{
                InputComp: Input,
              }}
            />
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </View>
  );
};

export default ManageKennelScreen;
