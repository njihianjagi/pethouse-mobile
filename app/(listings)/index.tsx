import React from 'react';
import {FlatList} from 'react-native';
import {YStack, Spinner} from 'tamagui';
import {useListingSearch} from '../../hooks/useListingSearch';

import {useRouter} from 'expo-router';
import {ListingCard} from '../../components/listing-card';
import {ListingFilters} from '../../components/listing-filters';

export const ListingsFeed = () => {
  const router = useRouter();

  const {
    listings,
    loading,
    filters,
    setFilters,
    loadMore,
    // refreshing,
    handleRefresh,
  } = useListingSearch();

  if (loading && !listings.length) {
    return (
      <YStack f={1} ai='center' jc='center'>
        <Spinner size='large' />
      </YStack>
    );
  }

  return (
    <YStack f={1}>
      <ListingFilters filters={filters} onFiltersChange={setFilters} />

      <FlatList
        data={listings}
        renderItem={({item}) => (
          <ListingCard
            listing={item}
            onPress={() => router.push(`/explore/listings/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id!}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        // refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{padding: 16}}
      />
    </YStack>
  );
};
