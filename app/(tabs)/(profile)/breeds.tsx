import React, {useState, useEffect} from 'react';
import {ScrollView, Alert} from 'react-native';
import {
  View,
  YStack,
  Button,
  Text,
  Separator,
  YGroup,
  ListItem,
  Spinner,
} from 'tamagui';
import {
  KennelBreed,
  useKennelData,
} from '../../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Trash, Plus, ChevronRight} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import BreedSelector from '../../../components/BreedSelector';
import {useListingData} from '../../../api/firebase/listings/useListingData';
import {useLitterData} from '../../../api/firebase/litters/useLitterData';
import {useRouter} from 'expo-router';

const BreedsScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();

  const {
    loading,
    error,
    getKennelByUserId,
    fetchKennelBreeds,
    addKennelBreed,
    deleteKennelBreed,
  } = useKennelData();
  const {fetchListingsByKennelId} = useListingData();
  const {fetchLittersByKennelId} = useLitterData();

  const [kennelBreeds, setKennelBreeds] = useState([] as KennelBreed[]);
  const [listings, setListings] = useState({});
  const [litters, setLitters] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const kennel = await getKennelByUserId(
          currentUser.id || currentUser.uid
        );
        if (kennel) {
          const breeds = await fetchKennelBreeds(kennel.id);
          setKennelBreeds(breeds);

          const kennelListings = await fetchListingsByKennelId(kennel.id);
          const listingsByBreed = kennelListings.reduce((acc, listing) => {
            acc[listing.breedId] = (acc[listing.breedId] || 0) + 1;
            return acc;
          }, {});
          setListings(listingsByBreed);

          const kennelLitters = await fetchLittersByKennelId(kennel.id);
          const littersByBreed = kennelLitters.reduce((acc, litter) => {
            acc[litter.breedId] = (acc[litter.breedId] || 0) + 1;
            return acc;
          }, {});
          setLitters(littersByBreed);
        }
      }
    };

    fetchData();
  }, [currentUser.id]);

  const handleAddBreed = async (breed) => {
    if (kennelBreeds.some((kb) => kb.breedId === breed.id)) {
      Alert.alert(
        'Breed already added',
        'This breed is already in your kennel.'
      );
      return;
    }
    await addKennelBreed(breed);
    setKennelBreeds((prev) => [...prev, {...breed, breedId: breed.id}]);
  };

  const handleRemoveBreed = async (kennelBreedId) => {
    await deleteKennelBreed(kennelBreedId);
    setKennelBreeds((prev) =>
      prev.filter((breed) => breed.id !== kennelBreedId)
    );
  };

  return (
    <View flex={1} backgroundColor={colorSet.primaryBackground}>
      <ScrollView>
        <YStack padding='$4' gap='$4'>
          {loading ? (
            <Spinner size='large' />
          ) : error ? (
            <Text color='$red10'>{error}</Text>
          ) : kennelBreeds.length === 0 ? (
            <Text>{localized('No breeds added yet.')}</Text>
          ) : (
            kennelBreeds.map((breed) => (
              <YGroup key={breed.id} separator={<Separator />} flex={1}>
                <YGroup.Item>
                  <ListItem
                    title={breed.breedName}
                    subTitle={breed.breedGroup}
                    iconAfter={
                      <Button
                        icon={Trash}
                        size='$2'
                        circular
                        onPress={() => handleRemoveBreed(breed.id)}
                      />
                    }
                  />
                </YGroup.Item>

                <YGroup.Item>
                  <ListItem
                    title='Listings'
                    iconAfter={
                      <Button
                        chromeless
                        iconAfter={ChevronRight}
                        size='$2'
                        circular
                        onPress={() => router.push('/listings')}
                      >
                        <Text>{listings[breed.breedId] || 0}</Text>
                      </Button>
                    }
                  />
                </YGroup.Item>
                <YGroup.Item>
                  <ListItem
                    title='Litters'
                    iconAfter={
                      <Button
                        chromeless
                        iconAfter={ChevronRight}
                        size='$2'
                        circular
                        onPress={() => router.push('/litters')}
                      >
                        <Text>{litters[breed.breedId] || 0}</Text>
                      </Button>
                    }
                  />
                </YGroup.Item>
              </YGroup>
            ))
          )}
          <BreedSelector
            onSelectBreed={handleAddBreed}
            kennelBreeds={kennelBreeds}
            buttonText={localized('Add Breed')}
          />
        </YStack>
      </ScrollView>
    </View>
  );
};

export default BreedsScreen;
