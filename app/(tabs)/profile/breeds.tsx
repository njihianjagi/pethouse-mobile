import React, {useEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import {View, YStack, Text, Spinner, XStack, Image} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Plus} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import BreedSelector from '../../../components/BreedSelector';
import {useRouter} from 'expo-router';
import {UserBreed} from '../../../api/firebase/breeds/useBreedData';
import {EmptyStateCard} from '../../../components/EmptyStateCard';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import UserBreedCard from '../../../components/user-breed-card';
import ParallaxScrollView from '../../../components/ParallaxScrollView';

const BreedsScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [breedSelectorOpen, setBreedSelectorOpen] = useState(false);
  const [userBreeds, setUserBreeds] = useState(
    currentUser.preferredBreeds || currentUser.kennel.primaryBreeds
  );
  // const {
  //   userBreeds,
  //   fetchUserBreeds,
  //   addUserBreed,
  //   deleteUserBreed,
  //   loading,
  //   error,
  // } = useBreedData(currentUser.id);

  useEffect(() => {
    setUserBreeds(
      currentUser.preferredBreeds || currentUser.kennel.primaryBreeds
    );
  }, [currentUser.id]);

  const handleAddBreed = async (breed) => {
    if (userBreeds.some((kb) => kb.breedId === breed.id)) {
      Alert.alert(
        'Breed already added',
        'This breed is already in your kennel.'
      );
      return;
    }
    const userBreed: UserBreed = {
      userId: currentUser.id,
      breedId: breed.id,
      breedName: breed.name,
      breedGroup: breed.breedGroup,
      images: [breed.image],
      yearsBreeding: 0,
      healthTesting: {
        dna: false,
        hips: false,
        eyes: false,
        heart: false,
      },
      isOwner: true,
    };

    await updateUser(currentUser.id, {
      ...(currentUser.role === 'breeder'
        ? {
            ...currentUser,
            kennel: {
              ...currentUser.kennel,
              primaryBreeds: [...currentUser.kennel.primaryBreeds, userBreed],
            },
          }
        : {
            ...currentUser,
            preferredBreeds: [...currentUser.preferredBreeds, userBreed],
          }),
    });
  };

  const handleRemoveBreed = async (userBreedId) => {
    const updatedUser = await updateUser(currentUser.id, {
      ...(currentUser.role === 'breeder'
        ? {
            ...currentUser,
            kennel: {
              ...currentUser.kennel,
              primaryBreeds: currentUser.kennel.primaryBreeds.filter(
                (userBreed) => userBreed.id !== userBreedId
              ),
            },
          }
        : {
            ...currentUser,
            preferredBreeds: (currentUser.preferredBreeds || []).filter(
              (breed) => breed.id !== userBreedId
            ),
          }),
    });
    dispatch(setUserData({user: updatedUser}));
  };

  return (
    <View flex={1} backgroundColor={colorSet.primaryBackground}>
      <ParallaxScrollView
        headerImage={
          <Image
            source={require('@/assets/images/doggo.png')}
            objectFit='contain'
          />
        }
        headerBackgroundColor={{
          dark: colorSet.primaryBackground,
          light: colorSet.primaryBackground,
        }}
      >
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
              buttonIcon={<Plus size='$2' color={colorSet.primaryBackground} />}
              backgroundImage={require('../../../assets/images/doggos_3.png')}
              backgroundColor={colorSet.secondaryForeground}
              color={''}
            />
          ) : (
            <FlatList
              data={userBreeds}
              numColumns={2}
              renderItem={({item, index}) => (
                <UserBreedCard
                  key={index}
                  userBreed={item}
                  handleRemoveBreed={handleRemoveBreed}
                />
              )}
              keyExtractor={(item) => item.breedId}
            />
          )}

          <BreedSelector
            onSelectBreed={handleAddBreed}
            userBreeds={userBreeds}
            open={breedSelectorOpen}
            onOpenChange={setBreedSelectorOpen}
          />
        </YStack>
      </ParallaxScrollView>
    </View>
  );
};

export default BreedsScreen;
