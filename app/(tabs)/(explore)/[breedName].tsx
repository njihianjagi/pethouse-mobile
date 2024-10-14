import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {ScrollView, StyleSheet} from 'react-native';
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
  Separator,
  YGroup,
  Spinner,
  View,
} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {CheckCircle, Heart} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../../hooks/useBreedSearch';

export default function BreedDetailScreen() {
  const {breedName} = useLocalSearchParams();

  const {traitPreferences, allBreeds} = useBreedSearch();

  // Function to determine if a trait matches user preferences
  const isTraitMatching = (traitName: string, traitValue: {score: number}) => {
    const preference = traitPreferences[traitName];
    if (preference === null || preference === undefined) return false;

    if (typeof preference === 'boolean') {
      return preference === true;
    } else if (typeof preference === 'number') {
      return traitValue.score >= preference;
    }
    return false;
  };

  const unslugifyBreedName = (sluggedName: string): string => {
    return sluggedName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const findBreedByName = (name: string, breeds: any[]): any | undefined => {
    return breeds.find(
      (breed) => breed.name.toLowerCase() === name.toLowerCase()
    );
  };

  const unslugifiedBreedName = unslugifyBreedName(breedName as string);
  const breed = findBreedByName(unslugifiedBreedName, allBreeds);

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {localized} = useTranslations();
  const styles = dynamicStyles(theme, appearance);

  if (!breed) {
    return (
      <View>
        <Spinner size='large' color={colorSet.primaryForeground} />
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
        <Image source={{uri: breed.image}} style={styles.image} />
        <YStack padding='$4' gap='$4'>
          <XStack justifyContent='space-between' alignItems='center'>
            <YStack>
              <H2>{breed.name}</H2>
              <Text>{`${breed.breedGroup} group • ${breed.popularity}% match`}</Text>
            </YStack>
            <Button icon={Heart} circular size='$5' themeShallow />
          </XStack>

          <Card bordered padding='$4'>
            <YStack gap='$2'>
              <Text fontSize='$6' fontWeight='bold'>
                {localized('Overview')}
              </Text>
              <Paragraph numberOfLines={3}>{breed.description}</Paragraph>
              <Button variant='outlined'>{localized('Read more...')}</Button>
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
                    <Text fontWeight='bold'>{localized('Life Span')}:</Text>
                    <Text>{breed.lifeSpan}</Text>
                  </XStack>
                </YStack>
              </YGroup.Item>
            </YGroup>
          </Card>

          <Card bordered>
            <YGroup gap='$4' padding='$4'>
              <YGroup.Item>
                <Text fontSize='$6' fontWeight='bold'>
                  {localized('Traits')}
                </Text>
              </YGroup.Item>

              {breed.traits &&
                Object.entries(breed.traits).map(([key, value]) => (
                  <YGroup.Item key={key}>
                    <ListItem
                      title={key}
                      subTitle={`Score: ${(value as {score: number}).score}`}
                      iconAfter={
                        isTraitMatching(key, value as {score: number}) ? (
                          <CheckCircle
                            color={theme.colors[appearance].primary}
                          />
                        ) : undefined
                      }
                      backgroundColor={
                        isTraitMatching(key, value as {score: number})
                          ? theme.colors[appearance].secondaryBackground
                          : undefined
                      }
                    />
                  </YGroup.Item>
                ))}
            </YGroup>
          </Card>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

const dynamicStyles = (theme, appearance) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    image: {
      width: '100%',
      height: 300,
      resizeMode: 'cover',
    },
  });
};
