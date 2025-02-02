import {View, Text} from 'react-native';
import React from 'react';
import {Listing} from '../../../../api/firebase/listings/useListingData';

const ListingCard = ({listing}: {listing: Listing}) => {
  return (
    <View>
      <Text>listing-card</Text>
    </View>
  );
};

export default ListingCard;
