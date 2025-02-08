import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Alert, FlatList, StyleSheet} from 'react-native';
import {YStack, Text, Button, XStack, View, Spinner, Image} from 'tamagui';
import BreedSelector from '../../../components/breed-selector';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';
import {Plus} from '@tamagui/lucide-icons';
import {UserBreed} from '../../../api/firebase/breeds/useBreedData';
import ParallaxScrollView from '../../../components/parallax-scrollview';
import UserBreedCard from '../../../components/user-breed-card';

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
    if (!currentUser) {
      router.replace('/');
    }
    if (currentUser?.kennel?.breeds) {
      setBreeds(currentUser.kennel.breeds);
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

    const existingBreed = breeds.find((b) => b.breedId === breed.id);
    if (!existingBreed) {
      setBreeds((prev) => [...prev, newBreed]);
    }
  };

  const handleRemoveBreed = (breedId: string) => {
    setBreeds((prev) => prev.filter((b) => b.breedId !== breedId));
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
        kennel: {
          ...currentUser.kennel,
          primaryBreeds: breeds,
        },
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData({user: userData}));
      router.replace('/(onboarding)/(breeder)/image-upload');
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View alignItems='center' justifyContent='center' flex={1}>
      <ParallaxScrollView
        headerImage={
          <Image
            source={require('../../../assets/images/doggo.png')}
            objectFit='contain'
          />
        }
        headerBackgroundColor={{
          dark: colorSet.primaryBackground,
          light: colorSet.primaryBackground,
        }}
      >
        <YStack padding='$4' gap='$4'>
          <YStack gap='$2' padding='$4'>
            <Text style={styles.stepIndicator}>
              {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
            </Text>

            <Text style={styles.title}>{localized('Select Your Breeds')}</Text>

            <Text style={styles.caption}>
              {localized('Tell us about the breeds you work with')}
            </Text>
          </YStack>

          <YStack gap='$4'>
            {breeds.length === 0 && (
              <TouchableOpacity
                onPress={() => setSelectorOpen(true)}
                style={[
                  dynamicStyles(theme, appearance).breedCard,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                  },
                ]}
              >
                <Plus size={48} color='$gray9' />
              </TouchableOpacity>
            )}

            <FlatList
              data={breeds}
              numColumns={2}
              renderItem={({item, index}) => (
                <XStack flex={1} key={index}>
                  <UserBreedCard
                    key={index}
                    userBreed={item}
                    handleRemoveBreed={handleRemoveBreed}
                  />
                </XStack>
              )}
              keyExtractor={(item) => item.breedId}
            />

            {breeds.length > 0 && breeds.length < 2 && (
              <Button onPress={() => setSelectorOpen(true)} theme='active'>
                {localized('Add Another Breed')}
              </Button>
            )}
            <Button
              backgroundColor={colorSet.secondaryForeground}
              color={colorSet.primaryForeground}
              onPress={handleContinue}
              disabled={loading}
              iconAfter={
                saving ? (
                  <Spinner color={colorSet.primaryForeground} />
                ) : undefined
              }
            >
              {saving ? localized('Please wait...') : localized('Continue')}
            </Button>
          </YStack>
        </YStack>
      </ParallaxScrollView>

      <BreedSelector
        onSelectBreed={handleAddBreed}
        userBreeds={breeds}
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
      />
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
    breedCard: {
      backgroundColor: colorSet.background,
      padding: 16,
      borderRadius: 8,
      shadowColor: colorSet.shadowColor,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: {width: 0, height: 2},
    },
  });
};

export default BreedsScreen;
