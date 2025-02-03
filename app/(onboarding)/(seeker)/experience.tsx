import React, {useState, useEffect} from 'react';
import {
  YStack,
  XStack,
  Text,
  RadioGroup,
  Button,
  Input,
  Card,
  Spinner,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {Plus, X} from '@tamagui/lucide-icons';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 2;

export const ExperienceScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<SeekerProfile['experience']>({
    dogExperience: 'first_time',
    currentPets: [],
    previousPets: [],
  });

  useEffect(() => {
    if (currentUser?.experience) {
      setFormData(currentUser.experience);
    }
  }, [currentUser]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCurrentPet = () => {
    handleChange('currentPets', [
      ...formData.currentPets,
      {type: '', breed: '', age: 0, spayedNeutered: false},
    ]);
  };

  const handleAddPreviousPet = () => {
    handleChange('previousPets', [
      ...formData.previousPets,
      {type: '', yearsOwned: 0, whatHappened: ''},
    ]);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.dogExperience) {
      alert(localized('Please select your dog experience level'));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser({
        experience: formData,
      });
      dispatch(setUserData(updatedUser));
      router.push('/(onboarding)/(seeker)/housing');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(localized('Error updating profile. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1}>
      <YStack gap='$4' px='$4' pb='$4'>
        <Text textAlign='center' fontSize='$6' fontWeight='bold'>
          {localized('Tell us about your pet experience')}
        </Text>
        <Text textAlign='center' color='$gray11'>
          {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
        </Text>

        {/* Dog Experience Level */}
        <YStack gap='$2'>
          <Text fontWeight='bold'>{localized('Dog Experience Level')}*</Text>
          <RadioGroup
            value={formData.dogExperience}
            onValueChange={(value) => handleChange('dogExperience', value)}
          >
            <YStack gap='$2'>
              <RadioGroup.Item value='first_time' size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized('First-time Dog Owner')}</Text>
              </RadioGroup.Item>
              <RadioGroup.Item value='some_experience' size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized('Some Experience')}</Text>
              </RadioGroup.Item>
              <RadioGroup.Item value='experienced' size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized('Experienced Dog Owner')}</Text>
              </RadioGroup.Item>
            </YStack>
          </RadioGroup>
        </YStack>

        {/* Current Pets */}
        <YStack gap='$2'>
          <XStack jc='space-between' ai='center'>
            <Text fontWeight='bold'>{localized('Current Pets')}</Text>
            <Button
              icon={Plus}
              size='$3'
              theme='active'
              onPress={handleAddCurrentPet}
            >
              {localized('Add Pet')}
            </Button>
          </XStack>

          {formData.currentPets.map((pet, index) => (
            <Card key={index} p='$4' bordered>
              <YStack gap='$2'>
                <XStack jc='space-between' ai='center'>
                  <Text fontSize='$6'>
                    {localized('Pet')} #{index + 1}
                  </Text>
                  <Button
                    icon={X}
                    size='$3'
                    theme='red'
                    onPress={() => {
                      const newPets = [...formData.currentPets];
                      newPets.splice(index, 1);
                      handleChange('currentPets', newPets);
                    }}
                  />
                </XStack>

                <Input
                  value={pet.type}
                  onChangeText={(value) => {
                    const newPets = [...formData.currentPets];
                    newPets[index] = {...pet, type: value};
                    handleChange('currentPets', newPets);
                  }}
                  placeholder={localized('Type of pet')}
                />

                <Input
                  value={pet.breed}
                  onChangeText={(value) => {
                    const newPets = [...formData.currentPets];
                    newPets[index] = {...pet, breed: value};
                    handleChange('currentPets', newPets);
                  }}
                  placeholder={localized('Breed (if applicable)')}
                />

                <Input
                  value={pet.age?.toString()}
                  onChangeText={(value) => {
                    const newPets = [...formData.currentPets];
                    newPets[index] = {...pet, age: parseInt(value) || 0};
                    handleChange('currentPets', newPets);
                  }}
                  keyboardType='numeric'
                  placeholder={localized('Age')}
                />

                <XStack gap='$2' ai='center'>
                  <RadioGroup
                    value={pet.spayedNeutered ? 'yes' : 'no'}
                    onValueChange={(value) => {
                      const newPets = [...formData.currentPets];
                      newPets[index] = {
                        ...pet,
                        spayedNeutered: value === 'yes',
                      };
                      handleChange('currentPets', newPets);
                    }}
                  >
                    <XStack gap='$4'>
                      <RadioGroup.Item value='yes' size='$4'>
                        <RadioGroup.Indicator />
                        <Text ml='$2'>{localized('Spayed/Neutered')}</Text>
                      </RadioGroup.Item>
                      <RadioGroup.Item value='no' size='$4'>
                        <RadioGroup.Indicator />
                        <Text ml='$2'>{localized('Not Spayed/Neutered')}</Text>
                      </RadioGroup.Item>
                    </XStack>
                  </RadioGroup>
                </XStack>
              </YStack>
            </Card>
          ))}
        </YStack>

        {/* Previous Pets */}
        <YStack gap='$2'>
          <XStack jc='space-between' ai='center'>
            <Text fontWeight='bold'>{localized('Previous Pets')}</Text>
            <Button
              icon={Plus}
              size='$3'
              theme='active'
              onPress={handleAddPreviousPet}
            >
              {localized('Add Pet')}
            </Button>
          </XStack>

          {formData.previousPets.map((pet, index) => (
            <Card key={index} p='$4' bordered>
              <YStack gap='$2'>
                <XStack jc='space-between' ai='center'>
                  <Text fontSize='$6'>
                    {localized('Pet')} #{index + 1}
                  </Text>
                  <Button
                    icon={X}
                    size='$3'
                    theme='red'
                    onPress={() => {
                      const newPets = [...formData.previousPets];
                      newPets.splice(index, 1);
                      handleChange('previousPets', newPets);
                    }}
                  />
                </XStack>

                <Input
                  value={pet.type}
                  onChangeText={(value) => {
                    const newPets = [...formData.previousPets];
                    newPets[index] = {...pet, type: value};
                    handleChange('previousPets', newPets);
                  }}
                  placeholder={localized('Type of pet')}
                />

                <Input
                  value={pet.yearsOwned?.toString()}
                  onChangeText={(value) => {
                    const newPets = [...formData.previousPets];
                    newPets[index] = {
                      ...pet,
                      yearsOwned: parseInt(value) || 0,
                    };
                    handleChange('previousPets', newPets);
                  }}
                  keyboardType='numeric'
                  placeholder={localized('Years owned')}
                />

                <Input
                  value={pet.whatHappened}
                  onChangeText={(value) => {
                    const newPets = [...formData.previousPets];
                    newPets[index] = {...pet, whatHappened: value};
                    handleChange('previousPets', newPets);
                  }}
                  placeholder={localized('What happened to the pet?')}
                  multiline
                  numberOfLines={3}
                />
              </YStack>
            </Card>
          ))}
        </YStack>
      </YStack>

      <YStack position='absolute' bottom={0} width='100%' p='$4'>
        <Button
          size='$6'
          theme='blue'
          onPress={handleSubmit}
          disabled={loading}
          iconAfter={loading ? () => <Spinner /> : undefined}
        >
          {localized('Continue')}
        </Button>
      </YStack>
    </YStack>
  );
};

export default ExperienceScreen;
