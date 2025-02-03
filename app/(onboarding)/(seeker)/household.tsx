import React, {useState, useEffect} from 'react';
import {
  YStack,
  XStack,
  Text,
  Input,
  Switch,
  Button,
  View,
  Spinner,
  Image,
} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import ParallaxScrollView from '../../../components/ParallaxScrollView';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

export const HouseholdScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<SeekerProfile['household']>({
    adults: 1,
    children: 0,
    childrenAges: [],
    hasAllergies: false,
    allergyDetails: '',
    familyAgreement: false,
  });

  useEffect(() => {
    if (currentUser?.household) {
      setFormData(currentUser.household);
    }
  }, [currentUser]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddChildAge = (age: number) => {
    const currentAges = formData.childrenAges || [];
    handleChange('childrenAges', [...currentAges, age]);
  };

  const handleRemoveChildAge = (index: number) => {
    const currentAges = formData.childrenAges || [];
    handleChange(
      'childrenAges',
      currentAges.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    // Basic validation
    if (formData.adults < 1) {
      alert(localized('Please enter at least 1 adult'));
      return;
    }

    if (
      formData.children > 0 &&
      (!formData.childrenAges ||
        formData.childrenAges.length !== formData.children)
    ) {
      alert(localized('Please enter ages for all children'));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        ...currentUser,
        household: formData,
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
        <YStack flex={1}>
          <YStack gap='$4' px='$4' pb='$4'>
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
              {localized('Tell us about your household')}
            </Text>

            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                textAlign: 'center',
                color: colorSet.primaryForeground,
              }}
            >
              {localized('This information will be shown to breeders')}
            </Text>

            <Text textAlign='center' color='$gray11'>
              {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
            </Text>

            {/* Adults */}
            <YStack gap='$2'>
              <Text fontWeight='bold'>{localized('Number of Adults')}*</Text>
              <Input
                value={formData.adults.toString()}
                onChangeText={(value) =>
                  handleChange('adults', parseInt(value) || 1)
                }
                keyboardType='numeric'
                placeholder='1'
              />
            </YStack>

            {/* Children */}
            <YStack gap='$2'>
              <Text fontWeight='bold'>{localized('Number of Children')}*</Text>
              <Input
                value={formData.children.toString()}
                onChangeText={(value) =>
                  handleChange('children', parseInt(value) || 0)
                }
                keyboardType='numeric'
                placeholder='0'
              />

              {formData.children > 0 && (
                <YStack gap='$2'>
                  <Text>{localized('Children Ages')}</Text>
                  <XStack flexWrap='wrap' gap='$2'>
                    {formData.childrenAges?.map((age, index) => (
                      <XStack
                        key={index}
                        borderWidth={1}
                        borderRadius='$4'
                        p='$2'
                        ai='center'
                      >
                        <Text mr='$2'>{age}</Text>
                        <Button
                          size='$2'
                          theme='red'
                          onPress={() => handleRemoveChildAge(index)}
                        >
                          ✕
                        </Button>
                      </XStack>
                    ))}
                  </XStack>
                  <Input
                    placeholder={localized('Add child age')}
                    keyboardType='numeric'
                    onSubmitEditing={(e) => {
                      const age = parseInt(e.nativeEvent.text);
                      if (age) handleAddChildAge(age);
                      (e.target as any).clear();
                    }}
                  />
                </YStack>
              )}
            </YStack>

            {/* Allergies */}
            <YStack gap='$2'>
              <XStack gap='$2' ai='center'>
                <Switch
                  checked={formData.hasAllergies}
                  onCheckedChange={(checked) =>
                    handleChange('hasAllergies', checked)
                  }
                />
                <Text>{localized('Anyone in household has allergies')}</Text>
              </XStack>

              {formData.hasAllergies && (
                <Input
                  value={formData.allergyDetails}
                  onChangeText={(value) =>
                    handleChange('allergyDetails', value)
                  }
                  placeholder={localized(
                    'Please provide details about the allergies'
                  )}
                />
              )}
            </YStack>

            {/* Family Agreement */}
            <XStack gap='$2' ai='center'>
              <Switch
                checked={formData.familyAgreement}
                onCheckedChange={(checked) =>
                  handleChange('familyAgreement', checked)
                }
              />
              <Text>
                {localized('All family members agree to getting a dog')}
              </Text>
            </XStack>
          </YStack>

          <YStack position='absolute' bottom={0} width='100%' p='$4'>
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
              {localized('Continue')}
            </Button>
          </YStack>
        </YStack>
      </ParallaxScrollView>
    </View>
  );
};

export default HouseholdScreen;
