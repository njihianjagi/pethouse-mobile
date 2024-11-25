import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {
  YStack,
  Text,
  Button,
  XStack,
  Switch,
  Input,
  Card,
  View,
  ScrollView,
  Spinner,
} from 'tamagui';
import BreedSelector from '../../../components/BreedSelector';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 2;

interface Breed {
  breedId: string;
  breedName: string;
  yearsBreeding: number;
  healthTesting: {
    dna: boolean;
    hips: boolean;
    eyes: boolean;
    heart: boolean;
  };
}

const BreedsScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const [breeds, setBreeds] = useState<Breed[]>([]);

  useEffect(() => {
    if (currentUser?.breeding?.breeds) {
      setBreeds(currentUser.breeding.breeds);
    }
  }, [currentUser]);

  const healthTests = ['dna', 'hips', 'eyes', 'heart'];

  const handleAddBreed = (breed: any) => {
    const newBreed: Breed = {
      breedId: breed.id,
      breedName: breed.name,
      yearsBreeding: 0,
      healthTesting: {
        dna: false,
        hips: false,
        eyes: false,
        heart: false,
      },
    };
    setBreeds(prev => [...prev, newBreed]);
  };

  const handleRemoveBreed = (breedId: string) => {
    setBreeds(prev => prev.filter(b => b.breedId !== breedId));
  };

  const handleUpdateBreed = (breedId: string, field: string, value: any) => {
    setBreeds(prev =>
      prev.map(breed => {
        if (breed.breedId === breedId) {
          if (field.startsWith('healthTesting.')) {
            const testName = field.split('.')[1];
            return {
              ...breed,
              healthTesting: {
                ...breed.healthTesting,
                [testName]: value,
              },
            };
          }
          return {...breed, [field]: value};
        }
        return breed;
      })
    );
  };

  const handleContinue = async () => {
    if (breeds.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...currentUser,
        breeding: {
          ...currentUser?.breeding,
          breeds,
        },
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData(userData));
      router.push('/(onboarding)/(breeder)/facilities');
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
      flex={1}
    >
      {loading ? (
        <Spinner size='large' color={colorSet.primaryForeground} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$4' padding='$4'>
              <Text style={styles.stepIndicator}>
                {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
              </Text>

              <Text style={styles.title}>
                {localized('Select Your Breeds')}
              </Text>

              <Text style={styles.caption}>
                {localized('Tell us about the breeds you work with')}
              </Text>
            </YStack>

            <YStack gap='$4'>
              <BreedSelector
                onSelectBreed={handleAddBreed}
                buttonText={breeds.length > 0 ? localized('Add Another Breed') : localized('Add Breed')}
              />

              {breeds.map((breed) => (
                <Card key={breed.breedId} elevate bordered p='$4'>
                  <YStack gap='$3'>
                    <XStack jc='space-between' ai='center'>
                      <Text fontSize='$6' fontWeight='bold'>
                        {breed.breedName}
                      </Text>
                      <Button
                        theme='red'
                        size='$3'
                        onPress={() => handleRemoveBreed(breed.breedId)}
                      >
                        {localized('Remove')}
                      </Button>
                    </XStack>

                    <Input
                      placeholder={localized('Years of breeding experience')}
                      keyboardType='numeric'
                      value={breed.yearsBreeding.toString()}
                      onChangeText={(value) =>
                        handleUpdateBreed(
                          breed.breedId,
                          'yearsBreeding',
                          parseInt(value) || 0
                        )
                      }
                    />

                    <Text fontSize='$5' fontWeight='bold'>
                      {localized('Health Testing')}
                    </Text>

                    {healthTests.map((test) => (
                      <XStack key={test} jc='space-between' ai='center'>
                        <Text textTransform='capitalize'>{test}</Text>
                        <Switch
                          checked={breed.healthTesting[test]}
                          onCheckedChange={(checked) =>
                            handleUpdateBreed(
                              breed.breedId,
                              `healthTesting.${test}`,
                              checked
                            )
                          }
                        />
                      </XStack>
                    ))}
                  </YStack>
                </Card>
              ))}

              <Button
                backgroundColor={colorSet.secondaryForeground}
                color={colorSet.primaryForeground}
                onPress={handleContinue}
                disabled={breeds.length === 0 || loading}
              >
                {loading ? localized('Please wait...') : localized('Continue')}
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      )}
    </View>
  );
};

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 0,
      marginBottom: 0,
      textAlign: 'center',
    },
    caption: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: colorSet.primaryForeground,
    },
    stepIndicator: {
      fontSize: 14,
      color: colorSet.primaryForeground,
      textAlign: 'center',
      opacity: 0.8,
    },
  });
};

export default BreedsScreen;
