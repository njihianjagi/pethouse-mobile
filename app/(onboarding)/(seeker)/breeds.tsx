import React, {useState, useEffect} from 'react';
import {
  YStack,
  XStack,
  Text,
  RadioGroup,
  Input,
  Button,
  Spinner,
  View,
  Image,
  Spacer,
} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import BreedSelector from '../../../components/BreedSelector';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import ParallaxScrollView from '../../../components/ParallaxScrollView';
import UserBreedCard from '../(breeder)/user-breed-card';
import {Plus} from '@tamagui/lucide-icons';
import {TouchableOpacity, FlatList} from 'react-native';
import breeds from '../(breeder)/breeds';
import dynamicStyles from '../../../dopebase/core/components/advanced/TouchableIcon/styles';
import {UserBreed} from '../../../api/firebase/breeds/useBreedData';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 1;

export const PreferredBreedsScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const [selectorOpen, setSelectorOpen] = useState(false);

  const [breeds, setBreeds] = useState<SeekerProfile['preferredBreeds']>([]);

  useEffect(() => {
    if (!currentUser?.id) {
      return router.replace('/');
    }
    if (currentUser?.preferences) {
      setBreeds(currentUser.preferences);
    }
  }, [currentUser]);

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

  const handleSubmit = async () => {
    // Basic validation
    if (breeds.length === 0) {
      alert(localized('Please select at least one breed preference'));
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        ...currentUser,
        preferredBreeds: breeds,
      });
      dispatch(setUserData(updatedUser));
      router.push('/(onboarding)/(seeker)/experience');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(localized('Error updating profile. Please try again.'));
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
        <YStack flex={1} gap='$4' padding='$4'>
          <YStack gap='$2'>
            <Text
              style={{
                fontSize: 14,
                color: colorSet.primaryForeground,
                textAlign: 'center',
                opacity: 0.8,
              }}
            >
              {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
            </Text>

            <Text
              style={{
                fontSize: 40,
                fontWeight: 'bold',
                color: colorSet.primaryForeground,
                marginTop: 0,
                marginBottom: 0,
                textAlign: 'center',
              }}
            >
              {localized('Tell us about your ideal dog')}
            </Text>

            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                textAlign: 'center',
                color: colorSet.primaryForeground,
              }}
            >
              {localized(
                'This information will be shown to potential adopters'
              )}
            </Text>
          </YStack>

          <YStack gap='$4'>
            {breeds.length === 0 && (
              <TouchableOpacity
                onPress={() => setSelectorOpen(true)}
                style={[
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
          </YStack>

          <Spacer flex={1} />

          <Button
            backgroundColor={colorSet.secondaryForeground}
            color={colorSet.primaryForeground}
            onPress={handleSubmit}
            disabled={loading}
            iconAfter={
              saving ? (
                <Spinner color={colorSet.primaryForeground} />
              ) : undefined
            }
          >
            {saving ? <></> : localized('Continue')}
          </Button>
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

export default PreferredBreedsScreen;
