import React, {useState, useEffect} from 'react';
import {
  YStack,
  Text,
  XStack,
  Input,
  View,
  Button,
  Image,
  Spinner,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import LocationSelector from '@/components/LocationSelector';
import {Copyright, Home, MapPin} from '@tamagui/lucide-icons';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 1;

export const BasicInfoScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    kennel: {
      name: '',
      yearsOfExperience: 0,
      website: '',
      description: '',
      location: {
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        coordinates: undefined,
      },
    },
  });

  const facilityTypes = [
    {value: 'home', label: 'Home Based'},
    {value: 'dedicated_facility', label: 'Dedicated Facility'},
  ];

  useEffect(() => {
    if (currentUser?.kennel) {
      setFormData((prev) => ({
        kennel: {
          ...prev.kennel,
          ...currentUser.kennel,
        },
      }));
    }
  }, [currentUser]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      kennel: {
        ...prev.kennel,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !formData.kennel.name ||
      !formData.kennel.location.address ||
      !formData.kennel.location.city ||
      !formData.kennel.location.state ||
      !formData.kennel.location.country
    ) {
      alert(localized('Please fill in all required fields'));
      return;
    }

    try {
      setSaving(true);
      const userData = {
        ...currentUser,
        kennel: formData.kennel,
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData({user: userData}));
      router.replace('/(onboarding)/(breeder)/breeds');
    } catch (error) {
      alert(localized('Failed to update profile. Please try again.'));
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
        <YStack padding='$4' gap='$4' flex={1} height='100%'>
          <YStack gap='$4' padding='$4'>
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
              {localized('Tell us about your kennel')}
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
            <YStack gap='$4'>
              <YStack gap='$2'>
                <XStack>
                  <Button disabled theme='active' icon={<Home />} />
                  <Input
                    flex={1}
                    value={formData.kennel.name}
                    onChangeText={(value) =>
                      handleInputChange('kennel', 'name', value)
                    }
                    placeholder={localized('Enter your kennel name')}
                    autoCapitalize='words'
                  />
                </XStack>
              </YStack>

              <YStack gap='$2'>
                <XStack>
                  <Button disabled theme='active' icon={<MapPin />} />
                  <Input
                    flex={1}
                    placeholder={localized('Search for your location')}
                    value={
                      formData.kennel.location.address
                        ? `${formData.kennel.location.address}`
                        : ''
                    }
                    onPressIn={() => setIsLocationSheetOpen(true)}
                  />
                </XStack>
              </YStack>

              <YStack gap='$2'>
                <XStack>
                  <Button disabled theme='active' icon={<Copyright />} />
                  <Input
                    flex={1}
                    value={formData.kennel.website}
                    onChangeText={(value) =>
                      handleInputChange('kennel', 'website', value)
                    }
                    placeholder={localized('Enter website (optional)')}
                  />
                </XStack>
              </YStack>
            </YStack>

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

      <LocationSelector
        isLocationSheetOpen={isLocationSheetOpen}
        setIsLocationSheetOpen={setIsLocationSheetOpen}
        onChange={(location) =>
          handleInputChange('kennel', 'location', location)
        }
        currentLocation={currentUser?.kennel?.location}
      />
    </View>
  );
};

export default BasicInfoScreen;
