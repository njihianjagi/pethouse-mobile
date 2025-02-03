import React, {useState, useEffect} from 'react';
import {
  YStack,
  XStack,
  Text,
  RadioGroup,
  Switch,
  Select,
  Input,
  Button,
  Spinner,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 3;

export const HousingScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<SeekerProfile['housing']>({
    type: 'own',
    propertyType: 'house',
    hasLandlordApproval: false,
    landlordContact: '',
    yard: {
      hasYard: false,
      yardSize: 'small',
      isFenced: false,
    },
  });

  useEffect(() => {
    if (currentUser?.housing) {
      setFormData(currentUser.housing);
    }
  }, [currentUser]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const propertyTypes = [
    {value: 'house', label: 'House'},
    {value: 'apartment', label: 'Apartment'},
    {value: 'condo', label: 'Condo'},
    {value: 'other', label: 'Other'},
  ];

  const yardSizes = [
    {value: 'small', label: 'Small'},
    {value: 'medium', label: 'Medium'},
    {value: 'large', label: 'Large'},
  ];

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.type || !formData.propertyType) {
      alert(localized('Please fill in all required fields'));
      return;
    }

    if (formData.type === 'rent' && !formData.hasLandlordApproval) {
      alert(localized('Please confirm landlord approval'));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        ...currentUser,
        housing: formData,
        onboardingComplete: true,
      });
      dispatch(setUserData(updatedUser));
      router.replace('/(tabs)');
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
          {localized('Tell us about your housing')}
        </Text>
        <Text textAlign='center' color='$gray11'>
          {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
        </Text>

        {/* Housing Type */}
        <YStack gap='$2'>
          <Text fontWeight='bold'>{localized('Housing Type')}*</Text>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) =>
              handleChange('type', value as SeekerProfile['housing']['type'])
            }
          >
            <XStack gap='$4'>
              <RadioGroup.Item value='own' size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized('Own')}</Text>
              </RadioGroup.Item>
              <RadioGroup.Item value='rent' size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized('Rent')}</Text>
              </RadioGroup.Item>
              <RadioGroup.Item value='live_with_parents' size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized('Live with Parents')}</Text>
              </RadioGroup.Item>
            </XStack>
          </RadioGroup>
        </YStack>

        {/* Property Type */}
        <YStack gap='$2'>
          <Text fontWeight='bold'>{localized('Property Type')}*</Text>
          <Select
            value={formData.propertyType}
            onValueChange={(value) => handleChange('propertyType', value)}
          >
            <Select.Trigger>
              <Select.Value placeholder={localized('Select property type')} />
            </Select.Trigger>
            <Select.Content>
              {propertyTypes.map((type, index) => (
                <Select.Item index={index} key={type.value} value={type.value}>
                  <Select.ItemText>{localized(type.label)}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </YStack>

        {/* Landlord Approval (if renting) */}
        {formData.type === 'rent' && (
          <YStack gap='$2'>
            <XStack gap='$2' ai='center'>
              <Switch
                checked={formData.hasLandlordApproval}
                onCheckedChange={(checked) =>
                  handleChange('hasLandlordApproval', checked)
                }
              />
              <Text>{localized('Have Landlord Approval')}</Text>
            </XStack>
            {formData.hasLandlordApproval && (
              <Input
                value={formData.landlordContact}
                onChangeText={(value) => handleChange('landlordContact', value)}
                placeholder={localized('Landlord contact information')}
              />
            )}
          </YStack>
        )}

        {/* Yard Information */}
        <YStack gap='$2'>
          <XStack gap='$2' ai='center'>
            <Switch
              checked={formData.yard.hasYard}
              onCheckedChange={(checked) =>
                handleChange('yard', {...formData.yard, hasYard: checked})
              }
            />
            <Text>{localized('Has Yard')}</Text>
          </XStack>

          {formData.yard.hasYard && (
            <YStack gap='$2'>
              <Text fontWeight='bold'>{localized('Yard Size')}</Text>
              <Select
                value={formData.yard.yardSize}
                onValueChange={(value) =>
                  handleChange('yard', {...formData.yard, size: value})
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder={localized('Select yard size')} />
                </Select.Trigger>
                <Select.Content>
                  {yardSizes.map((size, index) => (
                    <Select.Item
                      index={index}
                      key={size.value}
                      value={size.value}
                    >
                      <Select.ItemText>{localized(size.label)}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>

              <XStack gap='$2' ai='center'>
                <Switch
                  checked={formData.yard.isFenced}
                  onCheckedChange={(checked) =>
                    handleChange('yard', {...formData.yard, isFenced: checked})
                  }
                />
                <Text>{localized('Yard is Fenced')}</Text>
              </XStack>
            </YStack>
          )}
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

export default HousingScreen;
