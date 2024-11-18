import React, {useEffect} from 'react';
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
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Trash, Plus} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import BreedSelector from '../../../components/BreedSelector';
import {useRouter} from 'expo-router';
import useBreedData from '../../../api/firebase/breeds/useBreedData';
import {EmptyStateCard} from '../../../components/EmptyStateCard';
import {updateUser} from '../../../api/firebase/users/userClient';

const BreedsScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();

  const {
    userBreeds,
    fetchUserBreeds,
    addUserBreed,
    deleteUserBreed,
    loading,
    error,
  } = useBreedData(currentUser.id);

  useEffect(() => {
    fetchUserBreeds(currentUser.id);
  }, [currentUser.id]);

  const handleAddBreed = async (breed) => {
    if (userBreeds.some((kb) => kb.breedId === breed.id)) {
      Alert.alert(
        'Breed already added',
        'This breed is already in your kennel.'
      );
      return;
    }
    const userBreed = await addUserBreed(breed);

    await updateUser(currentUser.id, {
      userBreeds: {...currentUser.userBreeds, userBreed},
    });
  };

  const handleRemoveBreed = async (userBreedId) => {
    await deleteUserBreed(userBreedId);

    await updateUser(currentUser.id, {
      userBreeds: {
        ...(currentUser.userBreeds || []).filter(
          (userBreed) => userBreed.id !== userBreedId
        ),
      },
    });
  };

  return (
    <View flex={1} backgroundColor={colorSet.primaryBackground}>
      <ScrollView>
        <YStack padding='$4' gap='$4'>
          {loading ? (
            <Spinner size='large' />
          ) : error ? (
            <Text color='$red10'>{error}</Text>
          ) : userBreeds.length === 0 ? (
            <EmptyStateCard
              title={localized('No breeds added yet.')}
              description={''}
              buttonText={localized('Add a Breed')}
              onPress={() => {
                /* Add breed action */
              }}
              icon={<Plus size='$2' color={colorSet.primaryBackground} />}
              backgroundImage={require('../../../assets/images/doggos_3.png')}
              backgroundColor={colorSet.secondaryForeground}
              color={''}
            />
          ) : (
            userBreeds.map((breed) => (
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

                {/* <YGroup.Item>
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
                </YGroup.Item> */}
              </YGroup>
            ))
          )}
          <BreedSelector
            onSelectBreed={handleAddBreed}
            userBreeds={userBreeds}
            buttonText={localized('Add Breed')}
          />
        </YStack>
      </ScrollView>
    </View>
  );
};

export default BreedsScreen;
