import React, {useState} from 'react';
import {YStack, Text, ListItem, YGroup, Button} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useRouter} from 'expo-router';

export default function CreateListingScreen() {
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [listingType, setListingType] = useState<
    'litter' | 'adoption' | 'wanted'
  >(currentUser.role === 'breeder' ? 'litter' : 'wanted');

  return (
    <YStack flex={1} backgroundColor='$background'>
      <YStack gap='$4' w='100%' paddingHorizontal='$8'>
        <YGroup>
          <YGroup.Item>
            <Text fontSize='$6' fontWeight='bold'>
              Create Listing
            </Text>
            <Text fontSize='$3' color='$gray10'>
              Select the type of listing you want to create
            </Text>
          </YGroup.Item>

          {currentUser.role === 'breeder' && (
            <YGroup.Item>
              <ListItem
                theme='active'
                backgroundColor='$secondaryForeground'
                color='$primaryForeground'
                onPress={() => setListingType('litter')}
                title={localized('Litter')}
              />
            </YGroup.Item>
          )}

          <YGroup.Item>
            <ListItem
              theme='active'
              backgroundColor='$primaryForeground'
              color='$secondaryForeground'
              onPress={() => setListingType('adoption')}
              title={localized('Adoption')}
            />
          </YGroup.Item>

          <YGroup.Item>
            <ListItem
              theme='active'
              backgroundColor='$secondaryForeground'
              color='$primaryForeground'
              onPress={() => setListingType('wanted')}
              title={localized('Wanted')}
            />
          </YGroup.Item>
        </YGroup>
        <Button
          size='$5'
          theme='active'
          backgroundColor='$blue10'
          onPress={() => router.push(`/(listings)/(create)/${listingType}`)}
        >
          Next
        </Button>
      </YStack>
    </YStack>
  );
}
