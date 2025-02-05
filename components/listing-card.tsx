import React from 'react';
import {Card, YStack, XStack, Text, Image} from 'tamagui';
import {useTranslations} from '../dopebase';
import {Listing} from '../api/firebase/listings/useListingData';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
}

export const ListingCard = ({listing, onPress}: ListingCardProps) => {
  const {localized} = useTranslations();

  const calculateAge = (dateOfBirth) => {};
  const formatDate = (date) => {};

  const renderPreview = () => {
    switch (listing.type) {
      case 'adoption':
        return (
          <XStack gap='$2'>
            <Text>{listing.sex}</Text>
            <Text>•</Text>
            <Text>{calculateAge(listing.dateOfBirth)}</Text>
            <Text>•</Text>
            <Text>${listing.price}</Text>
          </XStack>
        );

      case 'litter':
        return (
          <XStack gap='$2'>
            <Text>
              {listing.puppyCount.male + listing.puppyCount.female}{' '}
              {localized('puppies')}
            </Text>
            <Text>•</Text>
            <Text>
              {localized('Expected')}: {formatDate(listing.expectedDate)}
            </Text>
          </XStack>
        );

      case 'wanted':
        return (
          <XStack gap='$2'>
            <Text>{listing.preferences.timeline}</Text>
            <Text>•</Text>
            <Text>
              ${listing.preferences.priceRange.min} - $
              {listing.preferences.priceRange.max}
            </Text>
          </XStack>
        );
    }
  };

  return (
    <Card bordered pressTheme onPress={onPress} mb='$4'>
      <YStack gap='$2' p='$4'>
        {'images' in listing && listing.images?.length > 0 && (
          <Image
            source={{uri: listing.images[0]}}
            width='100%'
            height={200}
            resizeMode='cover'
          />
        )}

        <Text fontWeight='bold'>
          {listing.type === 'wanted' ? 'Looking for: ' : ''}
          {listing.breed.breedName}
        </Text>

        {renderPreview()}
      </YStack>
    </Card>
  );
};
