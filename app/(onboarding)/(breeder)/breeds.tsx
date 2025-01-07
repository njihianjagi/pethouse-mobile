import React, {useState, useEffect} from 'react';
import {Alert, FlatList, StyleSheet} from 'react-native';
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
  Image,
} from 'tamagui';
import BreedSelector from '../../../components/BreedSelector';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';
import {EmptyStateCard} from '../../../components/EmptyStateCard';
import {Dog} from '@tamagui/lucide-icons';
import {Plus} from '@tamagui/lucide-icons';
import {UserBreed} from '../../../api/firebase/breeds/useBreedData';
import UserBreedCard from './user-breed-card';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 2;

const BreedsScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const [breeds, setBreeds] = useState<UserBreed[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.breeding?.breeds) {
      setBreeds(currentUser.breeding.breeds);
    }
  }, [currentUser]);

  const healthTests = ['dna', 'hips', 'eyes', 'heart'];

  const handleAddBreed = (breed: any) => {
    const newBreed: UserBreed = {
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
    setBreeds((prev) => [...prev, newBreed]);
  };

  const handleRemoveBreed = (breedId: string) => {
    setBreeds((prev) => prev.filter((b) => b.breedId !== breedId));
  };

  const handleUpdateBreed = (breedId: string, field: string, value: any) => {
    setBreeds((prev) =>
      prev.map((breed) => {
        if (breed.breedId === breedId) {
          return {...breed, [field]: value};
        }
        return breed;
      })
    );
  };

  const handleContinue = async () => {
    if (breeds.length === 0) {
      Alert.alert(
        localized('Error'),
        localized('Please add at least one breed to continue')
      );
      return;
    }

    setSaving(true);
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
      setSaving(false);
    }
  };

  return (
    <View
      alignItems='center'
      justifyContent='center'
      // backgroundColor={colorSet.primaryBackground}
      flex={1}
    >
      {loading ? (
        <Spinner size='large' color={colorSet.primaryForeground} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            // backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$2' padding='$4'>
              <Text style={styles.stepIndicator}>
                {localized('Step')} {CURRENT_STEP} {localized('of')}{' '}
                {TOTAL_STEPS}
              </Text>

              <Text style={styles.title}>
                {localized('Select Your Breeds')}
              </Text>

              <Text style={styles.caption}>
                {localized('Tell us about the breeds you work with')}
              </Text>
            </YStack>

            <YStack gap='$4'>
              {breeds.length === 0 && (
                <EmptyStateCard
                  title={localized('No Breeds Selected')}
                  description={localized('Add the breeds you work with')}
                  buttonText={localized('Add Breed')}
                  headerIcon={<Dog size={48} color='$gray9' />}
                  buttonIcon={<Plus size={20} color='$gray9' />}
                  headerAlign='center'
                  buttonAlign='center'
                  color='$gray9'
                  backgroundColor={colorSet.background}
                  gap='$6'
                  padding='$6'
                  onPress={() => setSelectorOpen(true)}
                />
              )}

              <BreedSelector
                onSelectBreed={handleAddBreed}
                open={selectorOpen}
                onOpenChange={setSelectorOpen}
              />

              <FlatList
                data={breeds}
                renderItem={({item, index}) => (
                  <XStack flex={1} key={index}>
                    <UserBreedCard
                      key={item.id}
                      userBreed={item}
                      handleRemoveBreed={handleRemoveBreed}
                    />
                  </XStack>
                )}
                keyExtractor={(item) => item.breedId}
              />

              {breeds.length > 0 && (
                <Button onPress={() => setSelectorOpen(true)} theme='active'>
                  {localized('Add Another Breed')}
                </Button>
              )}
              {breeds.length > 0 && (
                <Button
                  backgroundColor={colorSet.secondaryForeground}
                  color={colorSet.primaryForeground}
                  onPress={handleContinue}
                  disabled={breeds.length === 0 || loading}
                  iconAfter={
                    saving ? (
                      <Spinner
                        size='large'
                        color={colorSet.primaryForeground}
                      />
                    ) : undefined
                  }
                >
                  {saving ? localized('Please wait...') : localized('Continue')}
                </Button>
              )}
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
      fontSize: 36,
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
