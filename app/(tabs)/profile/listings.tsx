import React, {useState, useEffect} from 'react';
import {Alert, ScrollView} from 'react-native';
import {
  View,
  YStack,
  Text,
  XStack,
  Card,
  Button,
  ListItem,
  YGroup,
  Spinner,
} from 'tamagui';
import {
  Listing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {ArrowRight, Trash} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';

const ListingsScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();

  const {listings, loading, error, fetchListings, deleteListing} =
    useListingData();

  useEffect(() => {
    if (currentUser?.id) {
      fetchListings({userId: currentUser.id});
    }
  }, [currentUser?.id]);

  // const renderListingCard = (listing) => (
  //   <Card
  //     key={listing.id}
  //     bordered
  //     elevate
  //     size='$4'
  //     animation='bouncy'
  //     scale={0.9}
  //     hoverStyle={{scale: 0.925}}
  //     pressStyle={{scale: 0.875}}
  //     onPress={() => router.push(`/(listings)/${listing.id}`)}
  //   >
  //     <Card.Header padded>
  //       <Text fontSize='$5' fontWeight='bold'>
  //         {listing.name}
  //       </Text>
  //     </Card.Header>
  //     <Card.Footer padded>
  //       <XStack flex={1} justifyContent='space-between'>
  //         <Text fontSize='$3'>{listing.breed}</Text>
  //         <Text fontSize='$3'>{listing.age}</Text>
  //       </XStack>
  //     </Card.Footer>
  //   </Card>
  // );

  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteListing(listingId);
      Alert.alert('Success', 'Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      Alert.alert('Error', 'Failed to delete listing. Please try again.');
    }
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent='center' alignItems='center'>
        <Spinner size='large' />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent='center' alignItems='center'>
        <Text>{error}</Text>
      </YStack>
    );
  }

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
            // <XStack flexWrap='wrap' justifyContent='space-between'>
            //   {listings.map(renderListingCard)}
            // </XStack>
            <YGroup>
              {listings.map((listing) => (
                <YGroup.Item key={listing.id}>
                  <ListItem
                    title={listing.name}
                    subTitle={`${listing.breed} - ${listing.age}`}
                    onPress={() => router.push(`/(listings)/${listing.id}`)}
                    iconAfter={
                      <Button
                        chromeless
                        icon={Trash}
                        onPress={() => handleDeleteListing(listing.id)}
                      />
                    }
                  />
                </YGroup.Item>
              ))}
            </YGroup>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
};

export default ListingsScreen;
