import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {useTheme, useTranslations} from '../../../../dopebase';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import {useRouter} from 'expo-router';
import {
  Text,
  View,
  XStack,
  Button,
  YStack,
  Input,
  Spinner,
  XGroup,
} from 'tamagui';

import {ListFilter, Search} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../../../hooks/useBreedSearch';
import {SortPopover} from './sort';
import {BreedFilterSheet} from './filter';
import BreedCard from './breed-card';
import {useBreedMatch} from '../../../../hooks/useBreedMatch';

export default function ExploreBreedsScreen() {
  const router = useRouter();

  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const {
    searchText,
    filteredBreeds,
    traitGroups,
    traitPreferences,
    updateFilter,
    loading: breedsLoading,
    sortOption,
    page,
    hasMore,
    loadMoreBreeds,
    totalMatches,
  } = useBreedSearch();

  useEffect(() => {
    if (currentUser?.traitPreferences) {
      console.log('traitprefs', currentUser.traitPreferences);
      updateFilter('traitPreferences', currentUser.traitPreferences);
    }
  }, [currentUser]);

  const {calculateBreedMatch} = useBreedMatch();

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2'>
          <Input
            flex={1}
            color={colorSet.secondaryText}
            value={searchText}
            onChangeText={(text) => updateFilter('searchText', text)}
            placeholder={localized('Search by breed')}
          />
          <Button
            theme='active'
            icon={<ListFilter size='$1' />}
            onPress={() => setFilterSheetOpen(true)}
          ></Button>

          {Object.keys(traitPreferences).some(
            (key) => traitPreferences[key] !== null
          ) && (
            <View
              position='absolute'
              margin={0}
              padding={0}
              top={0}
              right={0}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={colorSet.primaryForeground}
            />
          )}
        </XStack>

        <XStack justifyContent='space-between' alignItems='center'>
          <SortPopover sortOption={sortOption} />
          <Text fontSize='$4' color={colorSet.primaryForeground}>
            {filteredBreeds.length} of {totalMatches} Breeds
          </Text>
        </XStack>

        {breedsLoading ? (
          <View
            flex={1}
            height='100vh'
            width='100%'
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems='center'
            justifyContent='center'
            backgroundColor='rgba(0,0,0,0.3)'
            zIndex={999}
          >
            <Spinner size='large' color={colorSet.primaryForeground} />
          </View>
        ) : filteredBreeds.length === 0 ? (
          <Text>No breeds match your current filters.</Text>
        ) : (
          <View>
            <FlatList
              data={filteredBreeds}
              renderItem={({item, index}) => (
                <XStack flex={1} key={index}>
                  <BreedCard breed={item} index={index} />
                </XStack>
              )}
              keyExtractor={(item) => item.name}
              numColumns={2}
              onEndReached={loadMoreBreeds}
              onEndReachedThreshold={0.1}
              ListFooterComponent={() =>
                hasMore && breedsLoading ? (
                  <View
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    alignItems='center'
                    justifyContent='center'
                    backgroundColor='rgba(0,0,0,0.3)'
                  >
                    <Spinner size='large' color={colorSet.primaryForeground} />
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </YStack>

      <BreedFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        traitGroups={traitGroups}
        traitPreferences={traitPreferences}
        updateFilter={updateFilter}
      />
    </View>
  );
}
