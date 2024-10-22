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
} from 'tamagui';
import {useTranslations} from '../dopebase';
import useKennelData from '../api/firebase/kennels/useKennelData';
import {useBreedSearch} from '../hooks/useBreedSearch';

interface BreedSelectorProps {
  onSelectBreed: (breedId: string, breedName: string) => void;
  kennelId?: string;
  buttonText?: string;
  maxHeight?: number | string;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  onSelectBreed,
  kennelId,
  buttonText = 'Select Breed',
  maxHeight = '60%',
}) => {
  const [open, setOpen] = useState(false);
  const {localized} = useTranslations();
  const {kennelBreeds, fetchKennelBreeds} = useKennelData();
  const {searchText, updateFilter, filteredBreeds, loading} = useBreedSearch();

  useEffect(() => {
    if (kennelId) {
      fetchKennelBreeds(kennelId);
    }
  }, [kennelId, fetchKennelBreeds]);

  const handleSearchTextChange = (text: string) => {
    updateFilter('searchText', text);
  };

  const handleSelectBreed = (breedId: string, breedName: string) => {
    onSelectBreed(breedId, breedName);
    setOpen(false);
  };

  return (
    <>
      <Button onPress={() => setOpen(true)}>{localized(buttonText)}</Button>
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[maxHeight]}
        snapPointsMode='constant'
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
            <ScrollView>
              {kennelId && kennelBreeds.length > 0 && (
                <>
                  <Text fontSize='$5' fontWeight='bold' marginBottom='$2'>
                    {localized('Kennel Breeds')}
                  </Text>
                  {kennelBreeds.map((breed) => (
                    <Button
                      key={breed.breedId}
                      onPress={() =>
                        handleSelectBreed(breed.breedId, breed.breedName)
                      }
                      marginBottom='$2'
                    >
                      {breed.breedName}
                    </Button>
                  ))}
                  <Separator marginVertical='$4' />
                </>
              )}

              <Text fontSize='$5' fontWeight='bold' marginBottom='$2'>
                {localized('All Breeds')}
              </Text>
              {loading ? (
                <Text>{localized('Loading...')}</Text>
              ) : (
                filteredBreeds.map((breed) => (
                  <ListItem
                    key={breed.id}
                    title={breed.name}
                    subTitle={breed.breedGroup}
                    onPress={() => handleSelectBreed(breed.id!, breed.name)}
                    marginBottom='$2'
                  ></ListItem>
                ))
              )}
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};

export default BreedSelector;
