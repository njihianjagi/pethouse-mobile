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
  View,
  Image,
  Adapt,
  Sheet,
  Label,
  Spacer,
} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import ParallaxScrollView from '../../../components/ParallaxScrollView';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 3;

export const HousingScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const [formData, setFormData] = useState<SeekerProfile['housing']>({
    propertyType: 'house',
    // hasLandlordApproval: false,
    // landlordContact: '',
    yard: 'none',
    children: 'none',
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
    {value: 'none', label: 'No Yard'},
    {value: 'small', label: 'Small'},
    {value: 'medium', label: 'Medium'},
    {value: 'large', label: 'Large'},
  ];

  const childrenOptions = [
    {value: 'none', label: 'No Children'},
    {value: 'toddlers', label: 'Toddlers (0-3 years)'},
    {value: 'young', label: 'Young Children (4-12 years)'},
    {value: 'teens', label: 'Teenagers (13+ years)'},
    {value: 'mixed', label: 'Mixed Ages'},
  ];

  const handleSubmit = async () => {
    setSaving(true);
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
        <YStack gap='$4' padding='$4' flex={1}>
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
              {localized('Tell us about your living situation')}
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
                'This information will be shown to breeders looking to rehome their dogs'
              )}
            </Text>
          </YStack>

          <YStack gap='$4'>
            {/* Property Type */}
            <YStack gap='$2'>
              <Text fontWeight='bold'>{localized('Property Type')}*</Text>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => handleChange('propertyType', value)}
              >
                <Select.Trigger w='100%' p='$3'>
                  <Select.Value
                    placeholder={localized('Select property type')}
                  />
                </Select.Trigger>

                <Adapt when='sm' platform='touch'>
                  <Sheet modal dismissOnSnapToBottom snapPointsMode='fit'>
                    <Sheet.Frame>
                      <Sheet.ScrollView>
                        <Adapt.Contents />
                      </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay />
                  </Sheet>
                </Adapt>

                <Select.Content zIndex={200000}>
                  <Select.ScrollUpButton
                    ai='center'
                    jc='center'
                    pos='relative'
                    w='100%'
                    h='$3'
                  >
                    <YStack zi={10} />
                  </Select.ScrollUpButton>

                  <Select.Viewport minWidth={200}>
                    <Select.Group>
                      {propertyTypes.map((type, index) => (
                        <Select.Item
                          index={index}
                          key={type.value}
                          value={type.value}
                        >
                          <Select.ItemText>
                            {localized(type.label)}
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>

                  <Select.ScrollDownButton
                    ai='center'
                    jc='center'
                    pos='relative'
                    w='100%'
                    h='$3'
                  >
                    <YStack zi={10} />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select>
            </YStack>

            {/* Yard Information */}
            <YStack gap='$2'>
              <YStack gap='$2'>
                <Text fontWeight='bold'>{localized('Yard Size')}</Text>
                <Select
                  value={formData.yard}
                  onValueChange={(value) =>
                    handleChange('yard', {...formData, yard: value})
                  }
                >
                  <Select.Trigger w='100%' p='$3'>
                    <Select.Value placeholder={localized('Select yard size')} />
                  </Select.Trigger>

                  <Adapt when='sm' platform='touch'>
                    <Sheet modal dismissOnSnapToBottom snapPointsMode='fit'>
                      <Sheet.Frame>
                        <Sheet.ScrollView>
                          <Adapt.Contents />
                        </Sheet.ScrollView>
                      </Sheet.Frame>
                      <Sheet.Overlay />
                    </Sheet>
                  </Adapt>

                  <Select.Content zIndex={200000}>
                    <Select.ScrollUpButton
                      ai='center'
                      jc='center'
                      pos='relative'
                      w='100%'
                      h='$3'
                    >
                      <YStack zi={10} />
                    </Select.ScrollUpButton>

                    <Select.Viewport minWidth={200}>
                      <Select.Group>
                        {yardSizes.map((size, index) => (
                          <Select.Item
                            index={index}
                            key={size.value}
                            value={size.value}
                          >
                            <Select.ItemText>
                              {localized(size.label)}
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>

                    <Select.ScrollDownButton
                      ai='center'
                      jc='center'
                      pos='relative'
                      w='100%'
                      h='$3'
                    >
                      <YStack zi={10} />
                    </Select.ScrollDownButton>
                  </Select.Content>
                </Select>
              </YStack>
            </YStack>

            {/* Children */}
            <YStack gap='$2'>
              <Text fontWeight='bold'>
                {localized('Children in Household')}
              </Text>
              <Select
                value={formData.children}
                onValueChange={(value) => handleChange('children', value)}
              >
                <Select.Trigger w='100%' p='$3'>
                  <Select.Value
                    placeholder={localized('Select children age group')}
                  />
                </Select.Trigger>

                <Adapt when='sm' platform='touch'>
                  <Sheet modal dismissOnSnapToBottom snapPointsMode='fit'>
                    <Sheet.Frame>
                      <Sheet.ScrollView>
                        <Adapt.Contents />
                      </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay />
                  </Sheet>
                </Adapt>

                <Select.Content zIndex={200000}>
                  <Select.ScrollUpButton
                    ai='center'
                    jc='center'
                    pos='relative'
                    w='100%'
                    h='$3'
                  >
                    <YStack zi={10} />
                  </Select.ScrollUpButton>

                  <Select.Viewport minWidth={200}>
                    <Select.Group>
                      {childrenOptions.map((option, index) => (
                        <Select.Item
                          index={index}
                          key={option.value}
                          value={option.value}
                        >
                          <Select.ItemText>
                            {localized(option.label)}
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>

                  <Select.ScrollDownButton
                    ai='center'
                    jc='center'
                    pos='relative'
                    w='100%'
                    h='$3'
                  >
                    <YStack zi={10} />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select>
            </YStack>
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
            {saving ? <></> : localized('Complete Profile')}
          </Button>
        </YStack>
      </ParallaxScrollView>
    </View>
  );
};

export default HousingScreen;
