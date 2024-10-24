import React, {useState, useEffect} from 'react';
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
import useKennelData, {
  KennelBreed,
} from '../api/firebase/kennels/useKennelData';
import {useBreedSearch} from '../hooks/useBreedSearch';
import useBreedData, {DogBreed} from '../api/firebase/breeds/useBreedData';
import {ChevronRight, Star} from '@tamagui/lucide-icons';
import {Alert, FlatList} from 'react-native';

interface BreedSelectorProps {
  onSelectBreed: (breed: DogBreed) => void;
  kennelBreeds: KennelBreed[];
  buttonText?: string;
  maxHeight?: number | string;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  onSelectBreed,
  kennelBreeds,
  buttonText = 'Select Breed',
}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [open, setOpen] = useState(false);
  const {localized} = useTranslations();

  const {searchText, updateFilter, filteredBreeds, loadMoreBreeds, hasMore} =
    useBreedSearch();
  const {
    loading: breedLoading,
    error: breedError,
    fetchBreedByName,
  } = useBreedData();

  const handleSearchTextChange = (text: string) => {
    updateFilter('searchText', text);
  };

  const handleSelectBreed = async (breed: DogBreed | KennelBreed) => {
    const breedName = 'name' in breed ? breed.name : breed.breedName;
    const breedDoc = await fetchBreedByName(breedName);

    if (!breedLoading && breedDoc) {
      setOpen(false);
      onSelectBreed({...breedDoc, ...breed});
    }

    if (breedError) {
      Alert.alert('Error selecting breed');
    }
  };

  return (
    <>
      <Button onPress={() => setOpen(true)} disabled={breedLoading}>
        {breedLoading ? <Spinner /> : localized(buttonText)}
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
          <YStack padding='$4'>
            <Text fontSize='$6' fontWeight='bold' marginBottom='$4'>
              {localized('Select a Breed')}
            </Text>
            <Input
              placeholder={localized('Search breeds')}
              value={searchText}
              onChangeText={handleSearchTextChange}
              marginBottom='$4'
            />

            <YStack gap='$4'>
              {kennelBreeds.length > 0 && (
                <YStack>
                  <Text>{localized('Your Breeds')}</Text>
                  {kennelBreeds.map((breed) => (
                    <ListItem
                      key={breed.id}
                      title={breed.breedName}
                      onPress={() => handleSelectBreed(breed)}
                      iconAfter={<Star />}
                    />
                  ))}
                  <Separator />
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
                    hasMore ? (
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
