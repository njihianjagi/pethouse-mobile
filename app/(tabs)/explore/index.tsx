import React, {useEffect} from 'react';
import {Href, useRouter} from 'expo-router';
import {useTheme} from '../../../dopebase';
import {Text, YStack, XStack, Card, H4, Paragraph, ScrollView} from 'tamagui';
import {Dog, Users, ShoppingBag} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {RecommendedBreeds} from './breeds/recommended-breeds';
import {MatchingBreeders} from './breeders/matching-breeders';

// interface ExploreCardProps {
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   onPress: () => void;
// }

// function ExploreCard({title, description, icon, onPress}: ExploreCardProps) {
//   const {theme, appearance} = useTheme();
//   const colorSet = theme.colors[appearance];

//   return (
//     <Card
//       elevate
//       bordered
//       animation='bouncy'
//       scale={0.9}
//       hoverStyle={{scale: 0.925}}
//       pressStyle={{scale: 0.875}}
//       onPress={onPress}
//       backgroundColor={colorSet.secondaryBackground}
//       borderColor={colorSet.border}
//     >
//       <Card.Header padded>
//         <XStack space='$3' ai='center'>
//           {icon}
//           <H4 color={colorSet.primaryText}>{title}</H4>
//         </XStack>
//       </Card.Header>
//       <Card.Footer padded>
//         <Paragraph color={colorSet.secondaryText}>{description}</Paragraph>
//       </Card.Footer>
//     </Card>
//   );
// }

export default function ExploreScreen() {
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  const currentUser = useCurrentUser();

  const {
    filteredBreeds,
    updateFilter,
    loading: breedsLoading,
    traitGroups,
    traitPreferences,
  } = useBreedSearch();

  useEffect(() => {
    if (currentUser?.traitPreferences) {
      updateFilter('traitPreferences', currentUser.traitPreferences);
    }
  }, [currentUser?.id]);

  const exploreOptions = [
    {
      title: 'Breeds',
      description: 'Discover and learn about different dog breeds',
      icon: <Dog size={24} color={colorSet.primaryForeground} />,
      route: '/explore/breeds',
    },
    {
      title: 'Breeders',
      description: 'Find reputable breeders near you',
      icon: <Users size={24} color={colorSet.primaryForeground} />,
      route: '/explore/breeders',
    },
    {
      title: 'Listings',
      description: 'Browse available puppies and dogs',
      icon: <ShoppingBag size={24} color={colorSet.primaryForeground} />,
      route: '/explore/listings',
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack
        f={1}
        backgroundColor={colorSet.primaryBackground}
        p='$4'
        space='$4'
      >
        {/* {exploreOptions.map((option) => (
        <ExploreCard
          key={option.title}
          title={option.title}
          description={option.description}
          icon={option.icon}
          onPress={() => router.push(option.route as Href)}
        />
      ))} */}

        {traitPreferences && Object.keys(traitPreferences).length > 0 && (
          <RecommendedBreeds
            loading={breedsLoading}
            filteredBreeds={filteredBreeds}
            traitPreferences={traitPreferences}
            updateFilter={updateFilter}
            traitGroups={traitGroups}
            onSelectBreed={(breed) =>
              router.push({
                pathname: '/(tabs)/explore/breeds/[breed_name]',
                params: {breed_name: breed.name},
              })
            }
          />
        )}

        {currentUser.userBreeds && currentUser.userBreeds.length > 0 && (
          <MatchingBreeders userBreeds={currentUser.userBreeds} />
        )}
      </YStack>
    </ScrollView>
  );
}
