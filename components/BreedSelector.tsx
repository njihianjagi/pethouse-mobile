import React, {useState, useEffect, useRef} from 'react';
import {
  Sheet,
  Button,
  Text,
  YStack,
  ScrollView,
  Input,
  Separator,
  ListItem,
  Spinner,
} from 'tamagui';
import {useTheme, useTranslations} from '../dopebase';

import {useBreedSearch} from '../hooks/useBreedSearch';
import useBreedData, {
  Breed,
  UserBreed,
} from '../api/firebase/breeds/useBreedData';
import {ChevronRight, Star} from '@tamagui/lucide-icons';
import {Alert, FlatList, Keyboard} from 'react-native';
import useCurrentUser from '../hooks/useCurrentUser';

interface BreedSelectorProps {
  onSelectBreed: (breed: Breed) => void;
  userBreeds?: UserBreed[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  onSelectBreed,
  userBreeds,
  open,
  onOpenChange,
}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const currentUser = useCurrentUser();
  const {localized} = useTranslations();

  const searchInputRef = useRef('' as any);

  const {
    loading: breedLoading,
    error,
    fetchBreedByName,
  } = useBreedData(currentUser?.id);

  const {
    loading,
    searchText,
    updateFilter,
    filteredBreeds,
    loadMoreBreeds,
    hasMore,
  } = useBreedSearch();

  const [availableBreeds, setAvailableBreeds] = useState<Breed[]>([]);

  useEffect(() => {
    if (userBreeds && filteredBreeds) {
      // Create a set of user breed names for efficient lookup
      const userBreedNames = new Set(
        userBreeds.map((breed) => breed.breedName)
      );

      // Filter out breeds that are already in user's breeds
      const filteredAvailableBreeds = filteredBreeds.filter(
        (breed) => !userBreedNames.has(breed.name)
      );

      setAvailableBreeds(filteredAvailableBreeds);
    } else {
      setAvailableBreeds(filteredBreeds);
    }
  }, [userBreeds, filteredBreeds]);

  const handleSearchTextChange = (text: string) => {
    updateFilter('searchText', text);
  };

  const handleSelectBreed = async (breed: Breed | UserBreed) => {
    const breedName = 'name' in breed ? breed.name : breed.breedName;
    const breedDoc = await fetchBreedByName(breedName);

    if (!loading && breedDoc) {
      onOpenChange(false);
      onSelectBreed({...breedDoc, ...breed});
    }

    if (error) {
      Alert.alert('Error selecting breed');
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[60, 80]}
      snapPointsMode='percent'
      dismissOnSnapToBottom
      zIndex={100000}
      animation='medium'
    >
      <Sheet.Overlay />
      <Sheet.Frame>
        <Sheet.Handle />
        <YStack padding='$4' gap='$4'>
          <Input
            ref={searchInputRef}
            placeholder={localized('Search breeds')}
            value={searchText}
            onChangeText={handleSearchTextChange}
            marginBottom='$4'
            onLayout={() => {
              open && searchInputRef.current?.focus();
              setTimeout(() => {
                open && searchInputRef.current?.focus();
              }, 100);
            }}
          />

          <YStack gap='$4'>
            {userBreeds && userBreeds.length > 0 && (
              <YStack gap='$2'>
                <Text>{localized('Your Breeds')}</Text>
                {userBreeds.map((breed) => (
                  <ListItem
                    key={breed.id}
                    title={breed.breedName}
                    onPress={() => handleSelectBreed(breed)}
                    iconAfter={<Star />}
                  />
                ))}
              </YStack>
            )}

            <YStack gap='$2'>
              <Text>{localized('All Breeds')}</Text>
              <FlatList
                data={availableBreeds}
                renderItem={({item, index}) => (
                  <ListItem
                    key={index}
                    title={<Text>{item.name}</Text>}
                    onPress={() => handleSelectBreed(item)}
                  />
                )}
                keyExtractor={(item) => item.name}
                numColumns={2}
                onEndReached={loadMoreBreeds}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() =>
                  hasMore && loading ? (
                    <Spinner size='large' color={colorSet.primaryForeground} />
                  ) : null
                }
              />
            </YStack>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export default BreedSelector;
