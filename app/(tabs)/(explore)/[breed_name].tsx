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
} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {CheckCircle, Heart, MapPin} from '@tamagui/lucide-icons';
import useKennelData from '../../../api/firebase/kennels/useKennelData';
import {
  DogBreed,
  useBreedData,
} from '../../../api/firebase/breeds/useBreedData';
import useCurrentUser from '../../../hooks/useCurrentUser';

function BreedDetailScreen() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {localized} = useTranslations();

  const [breed, setBreed] = useState({} as DogBreed);
  const [relevantKennels, setRelevantKennels] = useState([] as any);
  const currentUser = useCurrentUser();

  const {breed_name} = useLocalSearchParams();

  const [expanded, setExpanded] = useState(false);

  const unslugifyBreedName = (sluggedName: string): string => {
    return sluggedName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .toLowerCase();
  };

  const {
    fetchKennelsByBreed,
    kennels,
    loading: kennelsLoading,
    error: kennelsError,
  } = useKennelData();

  const {
    loading: breedLoading,
    error: breedError,
    fetchBreedByName,
    findBreedByName,
  } = useBreedData();

  useEffect(() => {
    const fetchBreed = async () => {
      const breedData = await fetchBreedByName(
        unslugifyBreedName(breed_name as string)
      );
      const localBreedData = await findBreedByName(
        unslugifyBreedName(breed_name as string)
      );

      setBreed({...breedData, ...localBreedData} as DogBreed);
    };
    fetchBreed();
  }, [breed_name]);

  useEffect(() => {
    if (breed?.id) {
      fetchKennelsByBreed(breed.id);
    }
  }, [breed]);

  useEffect(() => {
    if (kennels?.length) {
      setRelevantKennels(kennels);
    }
  }, [kennels]);

  // Function to determine if a trait matches user preferences
  const isTraitMatching = (traitName: string, traitValue: {score: number}) => {
    const preference = currentUser.traitPreferences[traitName];
    if (preference === null || preference === undefined) return false;

    if (typeof preference === 'boolean') {
      return preference === true;
    } else if (typeof preference === 'number') {
      return traitValue.score >= preference;
    }
    return false;
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
        <Image source={{uri: breed.image}} aspectRatio={3 / 2} />
        <YStack padding='$4' gap='$4'>
          <XStack justifyContent='space-between' alignItems='center'>
            <YStack>
              <H2>{breed.name}</H2>
              <Text>
                {`${breed.breedGroup} group${
                  currentUser?.traitPreferences
                    ? ` • ${breed.popularity}% match`
                    : ''
                }`}
              </Text>
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
                <Text>{localized('Kennels')}</Text>
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
                <YGroup separator={<Separator />}>
                  {breed.traits &&
                    Object.entries(breed.traits).map(([key, value]) => (
                      <YGroup.Item key={key}>
                        <ListItem
                          title={value.name}
                          subTitle={`Score: ${
                            (value as {score: number}).score
                          }`}
                          iconAfter={
                            currentUser?.traitPreferences &&
                            isTraitMatching(key, value as {score: number}) ? (
                              <CheckCircle
                                color={theme.colors[appearance].primary}
                              />
                            ) : undefined
                          }
                          backgroundColor={
                            currentUser?.traitPreferences &&
                            isTraitMatching(key, value as {score: number})
                              ? theme.colors[appearance].secondaryBackground
                              : undefined
                          }
                        />
                      </YGroup.Item>
                    ))}
                </YGroup>
              </Card>
            </Tabs.Content>

            <Tabs.Content value='tab3'>
              <Card bordered>
                <YGroup gap='$4' padding='$4'>
                  <YGroup.Item>
                    <Text fontSize='$6' fontWeight='bold'>
                      {localized('Kennels offering this breed')}
                    </Text>
                  </YGroup.Item>
                  <Separator />
                  {kennelsLoading ? (
                    <Spinner size='small' color={colorSet.primaryForeground} />
                  ) : kennelsError ? (
                    <Text color={colorSet.error}>{kennelsError}</Text>
                  ) : relevantKennels.length === 0 ? (
                    <Text>{localized('No kennels found for this breed')}</Text>
                  ) : (
                    relevantKennels.map((kennel) => (
                      <YGroup.Item key={kennel.id}>
                        <ListItem
                          title={kennel.name}
                          subTitle={kennel.location}
                          icon={MapPin}
                          iconAfter={
                            <Button
                              size='$2'
                              variant='outlined'
                              onPress={() => {
                                // Navigate to kennel detail page
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
