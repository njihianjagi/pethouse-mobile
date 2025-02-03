import React from 'react';
import {YStack, Text, Card, XStack, Button, Image, ScrollView} from 'tamagui';
import {useTranslations} from '../../dopebase';
import {useRouter} from 'expo-router';
import {Share} from 'react-native';
import {MessageCircle, Share as ShareIcon} from '@tamagui/lucide-icons';
import {
  AdoptionListing,
  LitterListing,
  WantedListing,
} from '../../api/firebase/listings/useListingData';

interface ListingDetailProps {
  listing: AdoptionListing | LitterListing | WantedListing;
  onContact: () => void;
}

export const ListingDetail = ({listing, onContact}: ListingDetailProps) => {
  const {localized} = useTranslations();
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${listing.type} listing: ${listing.breed.breedName}`,
        url: `app://listings/${listing.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const calculateAge = (dateOfBirth) => {};

  const renderContent = () => {
    switch (listing.type) {
      case 'adoption':
        return (
          <YStack gap='$4'>
            <Text fontSize='$6' fontWeight='bold'>
              {listing.name} - {listing.breed.breedName}
            </Text>

            <XStack flexWrap='wrap' gap='$2'>
              <Card bordered p='$2'>
                <Text>
                  {localized('Age')}: {calculateAge(listing.dateOfBirth)}
                </Text>
              </Card>
              <Card bordered p='$2'>
                <Text>
                  {localized('Sex')}: {listing.sex}
                </Text>
              </Card>
              <Card bordered p='$2'>
                <Text>
                  {localized('Color')}: {listing.color}
                </Text>
              </Card>
            </XStack>

            <Card bordered p='$4'>
              <YStack gap='$2'>
                <Text fontWeight='bold'>{localized('Health & Training')}</Text>
                {Object.entries(listing.health).map(([key, value]) =>
                  typeof value === 'boolean' && value ? (
                    <Text key={key}>✓ {localized(key)}</Text>
                  ) : null
                )}
                {Object.entries(listing.training).map(([key, value]) =>
                  typeof value === 'boolean' && value ? (
                    <Text key={key}>✓ {localized(key)}</Text>
                  ) : null
                )}
              </YStack>
            </Card>

            <Card bordered p='$4'>
              <YStack gap='$2'>
                <Text fontWeight='bold'>
                  {localized('Adoption Requirements')}
                </Text>
                {Object.entries(listing.requirements).map(([key, value]) => (
                  <Text key={key}>
                    • {localized(key)}: {value.toString()}
                  </Text>
                ))}
              </YStack>
            </Card>
          </YStack>
        );

      case 'wanted':
        return (
          <YStack gap='$4'>
            <Text fontSize='$6' fontWeight='bold'>
              {localized('Looking for')}: {listing.breed.breedName}
            </Text>

            <Card bordered p='$4'>
              <YStack gap='$2'>
                <Text fontWeight='bold'>{localized('Preferences')}</Text>
                <Text>
                  {localized('Sex')}: {listing.preferences.sex}
                </Text>
                <Text>
                  {localized('Age')}: {listing.preferences.ageRange.min} -
                  {listing.preferences.ageRange.max} {localized('months')}
                </Text>
                <Text>
                  {localized('Budget')}: ${listing.preferences.priceRange.min} -
                  ${listing.preferences.priceRange.max}
                </Text>
                <Text>
                  {localized('Timeline')}: {listing.preferences.timeline}
                </Text>
              </YStack>
            </Card>

            <Card bordered p='$4'>
              <YStack gap='$2'>
                <Text fontWeight='bold'>{localized('Situation')}</Text>
                <Text>
                  {localized('Experience')}: {listing.situation.experience}
                </Text>
                <Text>
                  {localized('Hours Alone')}: {listing.situation.hoursAlone}{' '}
                  {localized('hours/day')}
                </Text>
                {listing.situation.hasChildren && (
                  <Text>{localized('Has children')}</Text>
                )}
                {listing.situation.hasOtherPets && (
                  <Text>{localized('Has other pets')}</Text>
                )}
              </YStack>
            </Card>
          </YStack>
        );

      // ... similar case for litter listings
    }
  };

  return (
    <ScrollView>
      <YStack p='$4' gap='$4'>
        {'images' in listing && listing.images?.length > 0 && (
          <Image
            source={{uri: listing.images[0]}}
            width='100%'
            height={300}
            resizeMode='cover'
          />
        )}

        {renderContent()}

        <Text>{listing.description}</Text>

        <XStack gap='$4' justifyContent='flex-end'>
          <Button icon={ShareIcon} variant='outlined' onPress={handleShare}>
            {localized('Share')}
          </Button>
          <Button icon={MessageCircle} theme='active' onPress={onContact}>
            {localized('Contact')}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  );
};
