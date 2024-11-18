import React, {useEffect, useState} from 'react';
import {ScrollView, Image, FlatList} from 'react-native';
import {XStack, YStack, Text, Card, Button, H3, View, Spinner} from 'tamagui';
import {MapPin, Star, ChevronRight} from '@tamagui/lucide-icons';
import {useTheme} from '../dopebase';
import {useRouter} from 'expo-router';
import {useBreedData} from '../api/firebase/breeds/useBreedData';

interface MatchingBreedersProps {
  userBreeds: any[];
}

export const MatchingBreeders = ({userBreeds}: MatchingBreedersProps) => {
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const {loading, error, fetchUserBreedsByBreedId} = useBreedData();
  const [breedersMap, setBreedersMap] = useState<{[key: string]: any[]}>({});

  useEffect(() => {
    const loadBreedersByBreed = async () => {
      const breedersData = {};

      for (const breed of userBreeds) {
        const breedsWithUsers = await fetchUserBreedsByBreedId(breed.breedId);
        if (breedsWithUsers?.length > 0) {
          breedersData[breed.breedId] = breedsWithUsers;
        }
      }

      setBreedersMap(breedersData);
    };

    if (userBreeds?.length > 0) {
      loadBreedersByBreed();
    }
  }, [userBreeds]);

  const BreederCard = ({breeder}) => (
    <Card
      bordered
      elevate
      size='$4'
      width={280}
      marginRight='$4'
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/(breeders)/${breeder.userId}`)}
    >
      <Card.Header padded>
        <XStack gap='$2' alignItems='center'>
          <MapPin size={16} color={colorSet.primaryForeground} />
          <Text fontSize='$2' color={colorSet.secondaryText}>
            {breeder.user?.location?.name || 'Location unknown'}
          </Text>
        </XStack>
        <Text
          fontSize='$4'
          fontWeight='bold'
          color={colorSet.primaryForeground}
        >
          {breeder.user?.kennelName || breeder.user?.firstName}
        </Text>
      </Card.Header>

      {breeder.images?.[0] && (
        <Image
          source={{uri: breeder.images[0].thumbnailURL}}
          style={{
            width: '100%',
            height: 120,
            resizeMode: 'cover',
          }}
        />
      )}

      <Card.Footer padded>
        <XStack gap='$2' alignItems='center' justifyContent='space-between'>
          <XStack gap='$2' alignItems='center'>
            <Star size={16} color={colorSet.secondaryForeground} />
            <Text fontSize='$2' color={colorSet.secondaryText}>
              {breeder.user?.rating || '4.5'} (
              {breeder.user?.reviewCount || '0'})
            </Text>
          </XStack>
          <ChevronRight size={16} color={colorSet.secondaryText} />
        </XStack>
      </Card.Footer>
    </Card>
  );

  if (Object.keys(breedersMap).length === 0) {
    return null;
  }

  return (
    <YStack gap='$4'>
      {userBreeds?.map((breed) => {
        const breeders = breedersMap[breed.breedId] || [];
        if (breeders.length === 0) return null;

        return (
          <YStack key={breed.breedId} gap='$2'>
            <XStack
              justifyContent='space-between'
              alignItems='center'
              paddingHorizontal='$4'
            >
              <H3 fontWeight='bold' textTransform='capitalize'>
                {breed.breedName} Breeders
              </H3>
              <Button
                chromeless
                onPress={() =>
                  router.push({
                    pathname: '/(breeders)',
                    params: {breedId: breed.breedId},
                  })
                }
              >
                See All
              </Button>
            </XStack>

            {loading ? (
              <View
                flex={1}
                minHeight={128}
                justifyContent='center'
                alignItems='center'
              >
                <Spinner size='large' color={colorSet.primaryForeground} />
              </View>
            ) : error ? (
              <YStack
                flex={1}
                justifyContent='center'
                alignItems='center'
                padding='$4'
              >
                <Text color={colorSet.error}>
                  Unable to load breeders. Please try again later.
                </Text>
              </YStack>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={breeders}
                renderItem={({item: breeder}) => (
                  <BreederCard key={breeder.id} breeder={breeder} />
                )}
                keyExtractor={(breeder) => breeder.id}
                contentContainerStyle={{gap: 8, paddingHorizontal: 16}}
              />
            )}
          </YStack>
        );
      })}
    </YStack>
  );
};
