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
  buttonText?: string;
  maxHeight?: number | string;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  onSelectBreed,
  userBreeds,
  buttonText = 'Select Breed',
}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const currentUser = useCurrentUser();

  const [open, setOpen] = useState(false);
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

  const handleSearchTextChange = (text: string) => {
    updateFilter('searchText', text);
  };

  const handleSelectBreed = async (breed: Breed | UserBreed) => {
    const breedName = 'name' in breed ? breed.name : breed.breedName;
    const breedDoc = await fetchBreedByName(breedName);

    if (!loading && breedDoc) {
      setOpen(false);
      onSelectBreed({...breedDoc, ...breed});
    }

    if (error) {
      Alert.alert('Error selecting breed');
    }
  };

  return (
    <>
      <Button
        onPress={() => setOpen(true)}
        disabled={loading}
        backgroundColor={colorSet.secondaryForeground}
        color={colorSet.primaryForeground}
      >
        {loading ? (
          <Spinner color={colorSet.primaryForeground} />
        ) : (
          localized(buttonText)
        )}
      </Button>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[60, 80]}
        snapPointsMode='percent'
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame>
          <Sheet.Handle />
          <YStack padding='$4' gap='$4'>
            {/* <Text fontSize='$6' fontWeight='bold' marginBottom='$4'>
              {localized('Select a Breed')}
            </Text> */}
            <Input
              ref={searchInputRef}
              placeholder={localized('Search breeds')}
              value={searchText}
              onChangeText={handleSearchTextChange}
              marginBottom='$4'
              onLayout={() => {
                open && searchInputRef.current?.focus();
                Keyboard.dismiss();
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
                  data={filteredBreeds}
                  renderItem={({item, index}) => (
                    <ListItem
                      key={index}
                      title={item.name}
                      onPress={() => handleSelectBreed(item)}
                    ></ListItem>
                  )}
                  keyExtractor={(item) => item.name}
                  numColumns={2}
                  onEndReached={loadMoreBreeds}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={() =>
                    hasMore && loading ? (
                      <Spinner
                        size='large'
                        color={colorSet.primaryForeground}
                      />
                    ) : null
                  }
                />
              </YStack>
            </YStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};

export default BreedSelector;
