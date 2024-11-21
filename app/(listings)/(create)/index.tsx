import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {YStack, Text, Button, Spinner, Form, Tabs} from 'tamagui';
import {Alert} from 'react-native';
import {useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {
  Listing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import {AdoptionListingScreen} from './adoption';
import {WantedListingScreen} from './wanted';
import {LitterListingScreen} from './litter';

export default function CreateListingScreen() {
  const router = useRouter();
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();
  const {addListing} = useListingData();
  const [loading, setLoading] = useState(false);
  const [listingType, setListingType] = useState<
    'litter' | 'adoption' | 'wanted'
  >(currentUser.role === 'breeder' ? 'litter' : 'wanted');

  const [formData, setFormData] = useState({
    breed: {
      breedId: '',
      breedName: '',
    },
    status: 'active',
    media: {
      images: [],
      videos: [],
    },
    description: '',
    requirements: {
      application: false,
      contract: false,
      spayNeuter: false,
      returnPolicy: false,
      homeCheck: false,
      references: false,
      experience: false,
      yard: false,
      fence: false,
      otherPets: 'allowed',
      children: 'allowed',
    },
    ...(listingType === 'litter' && {
      expectedDate: new Date(),
      puppyCount: {
        male: 0,
        female: 0,
        available: 0,
        reserved: 0,
      },
      price: {
        base: 0,
        deposit: 0,
        depositRefundable: true,
      },
      registration: {
        type: 'limited',
        organization: '',
      },
      health: {
        dna: false,
        hips: false,
        eyes: false,
        heart: false,
      },
    }),
    ...(listingType === 'adoption' && {
      name: '',
      sex: 'male',
      dateOfBirth: new Date(),
      color: '',
      price: 0,
      health: {
        vaccinated: false,
        dewormed: false,
        microchipped: false,
        vetChecked: false,
      },
      training: {
        houseTrained: false,
        crateTrained: false,
        basicCommands: false,
      },
    }),
    ...(listingType === 'wanted' && {
      preferences: {
        sex: 'either',
        ageRange: {
          min: 0,
          max: 12,
        },
        priceRange: {
          min: 0,
          max: 5000,
        },
      },
    }),
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addListing({
        type: listingType,
        userId: currentUser.id,
        status: '',
        ...(formData as any),
      });
      Alert.alert(
        localized('Success'),
        localized('Your listing has been created')
      );
      router.back();
    } catch (error) {
      Alert.alert(
        localized('Error'),
        localized('Failed to create listing. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <YStack f={1} p='$4'>
        {currentUser.role === 'breeder' && (
          <Tabs
            value={listingType}
            onValueChange={(value) =>
              setListingType(value as typeof listingType)
            }
            flexGrow={1}
            mb='$4'
          >
            <Tabs.List>
              <Tabs.Tab value='litter' flex={1}>
                <Text>{localized('Litter')}</Text>
              </Tabs.Tab>
              <Tabs.Tab value='puppy' flex={1}>
                <Text>{localized('Puppy')}</Text>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        )}

        {listingType === 'litter' && (
          <LitterListingScreen
            formData={formData as any}
            onChange={handleInputChange}
          />
        )}
        {listingType === 'adoption' && (
          <AdoptionListingScreen
            formData={formData as any}
            onChange={handleInputChange}
          />
        )}
        {listingType === 'wanted' && (
          <WantedListingScreen
            formData={formData as any}
            onChange={handleInputChange}
          />
        )}

        <Button
          theme='active'
          onPress={handleSubmit}
          disabled={loading}
          icon={loading ? () => <Spinner /> : undefined}
          mt='$4'
        >
          {loading ? '' : localized('Create Listing')}
        </Button>
      </YStack>
    </Form>
  );
}
