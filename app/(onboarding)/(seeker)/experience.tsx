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
  Switch,
  View,
  Image,
  Label,
} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {Plus, X} from '@tamagui/lucide-icons';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import ParallaxScrollView from '../../../components/ParallaxScrollView';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 2;

export const ExperienceScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const [formData, setFormData] = useState<SeekerProfile['experience']>({
    dogExperience: 'first_time',
    breedingExperience: false,
    trainingExperience: false,
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

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.dogExperience) {
      alert(localized('Please select your dog experience level'));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        ...currentUser,
        experience: formData,
      });
      dispatch(setUserData({user: updatedUser}));
      router.push('/(onboarding)/(seeker)/housing');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(localized('Error updating profile. Please try again.'));
    } finally {
      setLoading(false);
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
          <YStack gap='$4' padding='$4'>
            <YStack gap='$2'>
              <Text
                style={{
                  fontSize: 14,
                  color: colorSet.primaryForeground,
                  textAlign: 'center',
                  opacity: 0.8,
                }}
              >
                {localized('Step')} {CURRENT_STEP} {localized('of')}{' '}
                {TOTAL_STEPS}
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
                {localized('Tell us about your pet experience')}
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
                  'This information will be shown to breeders and potential adopters'
                )}
              </Text>
            </YStack>

            <YStack gap='$2'>
              <Text>{localized('Experience Level')}*</Text>
              <RadioGroup
                value={formData.dogExperience}
                onValueChange={(value) => handleChange('dogExperience', value)}
              >
                <YStack gap='$2' width='100%'>
                  <XStack width={300} alignItems='center' gap='$4'>
                    <RadioGroup.Item value='first_time'>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor='first_time'>
                      {localized('First-time Dog Owner')}
                    </Label>
                  </XStack>
                  <XStack width={300} alignItems='center' gap='$4'>
                    <RadioGroup.Item value='some_experience'>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor='some_experience'>
                      {localized('Some Experience')}
                    </Label>
                  </XStack>

                  <XStack width={300} alignItems='center' gap='$4'>
                    <RadioGroup.Item value='experienced'>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor='experienced'>
                      {localized('Experienced Dog Owner')}
                    </Label>
                  </XStack>
                </YStack>
              </RadioGroup>
            </YStack>

            <XStack gap='$2' ai='center' jc='space-between'>
              <Text>{localized('Dog Breeding Experience')}</Text>

              <Switch
                checked={formData.breedingExperience}
                onCheckedChange={(checked) =>
                  handleChange('breedingExperience', checked)
                }
                backgroundColor={
                  formData.breedingExperience
                    ? colorSet.secondaryForeground
                    : '$gray3'
                }
              >
                <Switch.Thumb
                  animation='quicker'
                  backgroundColor={
                    formData.breedingExperience
                      ? colorSet.primaryForeground
                      : '$gray6'
                  }
                />
              </Switch>
            </XStack>

            <XStack gap='$2' ai='center' jc='space-between'>
              <Text>{localized('Dog Training Experience')}</Text>

              <Switch
                checked={formData.trainingExperience}
                onCheckedChange={(checked) =>
                  handleChange('trainingExperience', checked)
                }
                backgroundColor={
                  formData.trainingExperience
                    ? colorSet.secondaryForeground
                    : '$gray3'
                }
              >
                <Switch.Thumb
                  animation='quicker'
                  backgroundColor={
                    formData.trainingExperience
                      ? colorSet.primaryForeground
                      : '$gray6'
                  }
                />
              </Switch>
            </XStack>

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
        </YStack>
      </ParallaxScrollView>
    </View>
  );
};

export default ExperienceScreen;
