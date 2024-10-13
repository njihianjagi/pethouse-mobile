import React, {useState, useEffect} from 'react';
import {FlatList, ScrollView} from 'react-native';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useNavigation, useRouter} from 'expo-router';
import {
  Text,
  View,
  XStack,
  Button,
  YStack,
  Input,
  Card,
  Spinner,
  Popover,
} from 'tamagui';
import {ListFilter, ArrowRight, ChevronDown} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {BreedFilterSheet} from './filter';
import {useDispatch} from 'react-redux';
import {updateFilter} from '../../../redux/reducers/filter';
import {SortPopover} from './sort';

export default function ExploreScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useDispatch();

  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const {
    searchText,
    filteredBreeds,
    traitPreferences,
    handleSearchChange,
    loading: breedsLoading,
    sortOption,
    handleSortChange,
  } = useBreedSearch();

  useEffect(() => {
    if (currentUser?.traitPreferences) {
      dispatch(updateFilter({traitPreferences: currentUser.traitPreferences}));
    }
  }, [currentUser, dispatch]);

  const CardItem = ({breed}) => (
    <Card bordered flex={1} margin={5}>
      <Card.Header padded>
        <Text
          color={colorSet.primaryForeground}
          fontSize={24}
          fontWeight='bold'
        >
          {breed.name}
        </Text>
      </Card.Header>

      <Card.Footer padded>
        <XStack flex={1} />
        <Button
          borderRadius='$10'
          icon={<ArrowRight size='$2' color={colorSet.primaryForeground} />}
          chromeless
        ></Button>
      </Card.Footer>

      <Card.Background
        backgroundColor={colorSet.secondaryForeground}
        borderRadius={16}
      />
    </Card>
  );

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2'>
          <Input
            flex={1}
            color={colorSet.secondaryText}
            value={searchText}
            onChangeText={(text) => handleSearchChange(text)}
            placeholder={localized('Search by breed')}
          />

          <Button
            size='$4'
            theme='active'
            icon={ListFilter}
            onPress={() => setFilterSheetOpen(true)}
          />
        </XStack>

        <XStack justifyContent='space-between' alignItems='center'>
          <SortPopover
            sortOption={sortOption}
            handleSortChange={handleSortChange}
          />

          <Text fontSize='$4' fontWeight='bold'>
            {filteredBreeds.length} Breeds
          </Text>
        </XStack>

        {breedsLoading ? (
          <Spinner
            size='large'
            color={colorSet.primaryForeground}
            margin='auto'
          />
        ) : filteredBreeds.length === 0 ? (
          <Text>No breeds match your current filters.</Text>
        ) : (
          <ScrollView>
            <FlatList
              data={filteredBreeds}
              renderItem={({item, index}) => (
                <XStack flex={1} key={index}>
                  <CardItem breed={item} />
                </XStack>
              )}
              keyExtractor={(item) => item.name}
              numColumns={2}
              scrollEnabled={false}
            />
          </ScrollView>
        )}
      </YStack>

      <BreedFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
      />
    </View>
  );
}
