import React, {useEffect, useState} from 'react';
import {useLocalSearchParams} from 'expo-router';
import {ScrollView} from 'react-native';
import {
  Text,
  Image,
  YStack,
  XStack,
  Card,
  Button,
  H2,
  Paragraph,
  ListItem,
  YGroup,
  Spinner,
  View,
  Separator,
  Tabs,
  Accordion,
} from 'tamagui';
import {useTheme, useTranslations} from '../../../../dopebase';
import {
  CheckCircle,
  ChevronDown,
  Heart,
  MapPin,
  Star,
  StarHalf,
  StarOff,
} from '@tamagui/lucide-icons';
import {
  Breed,
  useBreedData,
} from '../../../../api/firebase/breeds/useBreedData';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import {useBreedMatch} from '../../../../hooks/useBreedMatch';

function BreedDetailScreen() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {localized} = useTranslations();

  const [breed, setBreed] = useState({} as Breed);
  const currentUser = useCurrentUser();

  const {breed_name} = useLocalSearchParams();

  const [expanded, setExpanded] = useState(false);
  const {calculateBreedMatch} = useBreedMatch();
  const [matchPercentage, setMatchPercentage] = useState(null as any);

  const unslugifyBreedName = (sluggedName: string): string => {
    return sluggedName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .toLowerCase();
  };

  const {
    loading: breedLoading,
    error: breedError,
    userBreeds,
    fetchBreedByName,
    findBreedByName,
    fetchUserBreedsByBreedId,
  } = useBreedData();

  useEffect(() => {
    const fetchBreed = async () => {
      const breedData = await fetchBreedByName(
        unslugifyBreedName(breed_name as string)
      );
      const localBreedData = await findBreedByName(
        unslugifyBreedName(breed_name as string)
      );

      setBreed({...breedData, ...localBreedData} as Breed);
    };
    fetchBreed();
  }, [breed_name]);

  useEffect(() => {
    if (breed?.id) {
      fetchUserBreedsByBreedId(breed.id);
    }
  }, [breed]);

  useEffect(() => {
    if (currentUser?.traitPreferences) {
      const matchPercentage = Math.round(
        calculateBreedMatch(breed, currentUser.traitPreferences)
      );

      setMatchPercentage(matchPercentage);
    }
  }, [breed, currentUser]);

  // Function to determine if a trait matches user preferences
  const isTraitMatching = (trait: {name: string; score: number}) => {
    const preference = currentUser.traitPreferences[trait.name];
    if (preference === null || preference === undefined) return false;

    if (typeof preference === 'boolean') {
      return preference === true;
    } else if (typeof preference === 'number') {
      return trait.score >= preference;
    }
    return false;
  };

  const RatingStars = ({score}: {score: number}) => {
    const totalStars = 5;
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <XStack gap='$0.5' alignItems='center'>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={16}
            color={colorSet.primaryForeground}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <StarHalf size={16} color={colorSet.primaryForeground} />
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <StarOff
            key={`empty-${i}`}
            size={16}
            color={colorSet.secondaryForeground}
            opacity={0.5}
          />
        ))}
      </XStack>
    );
  };

  if (breedLoading && !breedError && !breed?.id) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Spinner size='large' color={colorSet.primaryForeground} />
      </View>
    );
  }

  if (!breedLoading && breedError) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Text>Error loading breed</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: colorSet.primaryBackground,
      }}
    >
      <YStack>
        {breed && (
          <Image
            source={{uri: breed.image ? breed.image : ''}}
            aspectRatio={3 / 2}
          />
        )}
        <YStack padding='$4' gap='$4'>
          <XStack justifyContent='space-between' alignItems='center'>
            <YStack>
              <H2>{breed.name}</H2>

              <XStack>
                <Text>{`${breed.breedGroup} group`}</Text>
                <Text>{` | ${matchPercentage}% match`}</Text>
              </XStack>
            </YStack>
            <Button icon={Heart} circular size='$5' themeShallow />
          </XStack>

          <Tabs
            defaultValue='tab1'
            orientation='horizontal'
            flexDirection='column'
          >
            <Tabs.List flex={1} paddingBottom='$4' bordered>
              <Tabs.Tab value='tab1' flex={1}>
                <Text>{localized('Overview')}</Text>
              </Tabs.Tab>
              <Tabs.Tab value='tab2' flex={1}>
                <Text>{localized('Traits')}</Text>
              </Tabs.Tab>
              <Tabs.Tab value='tab3' flex={1}>
                <Text>{localized('Breeders')}</Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Content value='tab1'>
              <YStack gap='$4'>
                <Card bordered padding='$4'>
                  <YStack gap='$2'>
                    <Text fontSize='$6' fontWeight='bold'>
                      {localized('Overview')}
                    </Text>
                    <Paragraph numberOfLines={expanded ? undefined : 3}>
                      {breed.description}
                    </Paragraph>
                    <Button
                      variant='outlined'
                      onPress={() => setExpanded(!expanded)}
                    >
                      {localized(expanded ? 'Show less' : 'Read more...')}
                    </Button>
                  </YStack>
                </Card>

                <Card bordered padding='$4'>
                  <YGroup gap='$4'>
                    <YGroup.Item>
                      <Text fontSize='$6' fontWeight='bold'>
                        {localized('About the breed')}
                      </Text>
                    </YGroup.Item>
                    <YGroup.Item>
                      <YStack gap='$2'>
                        <XStack gap='$2' alignItems='center'>
                          <Text fontWeight='bold'>{localized('Height')}:</Text>
                          <Text>{breed.height}</Text>
                        </XStack>
                        <XStack gap='$2' alignItems='center'>
                          <Text fontWeight='bold'>{localized('Weight')}:</Text>
                          <Text>{breed.weight}</Text>
                        </XStack>
                        <XStack gap='$2' alignItems='center'>
                          <Text fontWeight='bold'>
                            {localized('Life Span')}:
                          </Text>
                          <Text>{breed.lifeSpan}</Text>
                        </XStack>
                      </YStack>
                    </YGroup.Item>
                  </YGroup>
                </Card>
              </YStack>
            </Tabs.Content>

            <Tabs.Content value='tab2'>
              <Card bordered>
                {breed.traits &&
                  breed.traits.map((group) => (
                    <Accordion key={group.name} type='multiple'>
                      <Accordion.Item value={group.name}>
                        <Accordion.Trigger>
                          <XStack
                            flex={1}
                            justifyContent='space-between'
                            alignItems='center'
                          >
                            <Text fontWeight='bold'>{group.name}</Text>
                            <XStack gap='$2' alignItems='center'>
                              <RatingStars score={group.score} />
                              <ChevronDown />
                            </XStack>
                          </XStack>
                        </Accordion.Trigger>

                        <Accordion.Content padding={0}>
                          <YGroup separator={<Separator />}>
                            {group.traits.map((trait) => (
                              <YGroup.Item key={trait.name}>
                                <ListItem
                                  title={trait.name}
                                  iconAfter={
                                    <XStack gap='$2' alignItems='center'>
                                      <RatingStars score={trait.score} />
                                      {currentUser?.traitPreferences &&
                                        isTraitMatching(trait) && (
                                          <CheckCircle
                                            color={
                                              theme.colors[appearance].primary
                                            }
                                          />
                                        )}
                                    </XStack>
                                  }
                                  backgroundColor={
                                    currentUser?.traitPreferences &&
                                    isTraitMatching(trait)
                                      ? theme.colors[appearance]
                                          .secondaryBackground
                                      : undefined
                                  }
                                />
                              </YGroup.Item>
                            ))}
                          </YGroup>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion>
                  ))}
              </Card>
            </Tabs.Content>

            <Tabs.Content value='tab3'>
              <Card bordered>
                <YGroup gap='$4' padding='$4'>
                  <YGroup.Item>
                    <Text fontSize='$6' fontWeight='bold'>
                      {localized('Breeders offering this breed')}
                    </Text>
                  </YGroup.Item>
                  <Separator />
                  {breedLoading ? (
                    <Spinner size='small' color={colorSet.primaryForeground} />
                  ) : breedError ? (
                    <Text color={colorSet.error}>{breedError}</Text>
                  ) : userBreeds.length === 0 ? (
                    <Text>
                      {localized('No owners or kennels found for this breed')}
                    </Text>
                  ) : (
                    userBreeds.map((userBreed) => (
                      <YGroup.Item key={userBreed.id}>
                        <ListItem
                          title={
                            userBreed.user?.username ||
                            userBreed.user?.firstName +
                              ' ' +
                              userBreed.user?.lastName ||
                            'Unknown'
                          }
                          subTitle={
                            userBreed.user?.location?.name ||
                            userBreed.kennel?.location?.name ||
                            'Unknown location'
                          }
                          icon={userBreed.kennelId ? MapPin : Heart}
                          iconAfter={
                            <Button
                              size='$2'
                              variant='outlined'
                              onPress={() => {
                                // Navigate to kennel or user detail page
                                // You'll need to implement this navigation
                              }}
                            >
                              {localized('View')}
                            </Button>
                          }
                        />
                      </YGroup.Item>
                    ))
                  )}
                </YGroup>
              </Card>
            </Tabs.Content>
          </Tabs>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

export default BreedDetailScreen;
