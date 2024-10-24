import React, {useState, useEffect} from 'react';
import {ScrollView} from 'react-native';
import {View, YStack, Text, XStack, Card, Button} from 'tamagui';
import {
  Listing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {ArrowRight} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import {useKennelData} from '../../../api/firebase/kennels/useKennelData';

const ListingsScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();

  const {fetchListingsByKennelId} = useListingData();
  const {getKennelByUserId} = useKennelData();

  const [listings, setListings] = useState([] as Listing[]);

  useEffect(() => {
    const fetchListings = async () => {
      if (currentUser) {
        const kennel = await getKennelByUserId(
          currentUser.id || currentUser.uid
        );
        if (kennel) {
          const kennelListings = await fetchListingsByKennelId(kennel.id);
          setListings(kennelListings);
        }
      }
    };

    fetchListings();
  }, [currentUser.id]);

  const renderListingCard = (listing) => (
    <Card
      key={listing.id}
      bordered
      elevate
      size='$4'
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/(listings)/${listing.id}`)}
    >
      <Card.Header padded>
        <Text fontSize='$5' fontWeight='bold'>
          {listing.name}
        </Text>
      </Card.Header>
      <Card.Footer padded>
        <XStack flex={1} justifyContent='space-between'>
          <Text fontSize='$3'>{listing.breed}</Text>
          <Text fontSize='$3'>{listing.age}</Text>
        </XStack>
      </Card.Footer>
    </Card>
  );

  return (
    <View flex={1} backgroundColor={colorSet.primaryBackground}>
      <ScrollView>
        <YStack padding='$4' gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Listings')}
          </Text>
          {listings.length === 0 ? (
            <Card
              bordered
              elevate
              size='$4'
              onPress={() => router.push('/create-listing')}
            >
              <Card.Header padded>
                <Text fontSize='$5' fontWeight='bold'>
                  {localized('Create New Listing')}
                </Text>
              </Card.Header>
              <Card.Footer padded>
                <Button icon={ArrowRight}>{localized('Get Started')}</Button>
              </Card.Footer>
            </Card>
          ) : (
            <XStack flexWrap='wrap' justifyContent='space-between'>
              {listings.map(renderListingCard)}
            </XStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
};

export default ListingsScreen;
