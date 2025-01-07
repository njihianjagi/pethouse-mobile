import React, {useState, useEffect} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {
  YStack,
  Input,
  Text,
  View,
  ScrollView,
  Spinner,
  Button,
  XGroup,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import LocationSelector from '../../../components/LocationSelector';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';
import {Copyright, Home, MapPin} from '@tamagui/lucide-icons';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 1;

export const BasicInfoScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const [formData, setFormData] = useState({
    kennel: {
      name: '',
      registrationNumber: '',
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

  useEffect(() => {
    if (currentUser?.kennel) {
      setFormData((prev) => ({
        ...prev,
        kennel: currentUser.kennel,
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

  const handleContinue = async () => {
    if (
      !formData.kennel.name ||
      !formData.kennel.location.address ||
      !formData.kennel.location.city ||
      !formData.kennel.location.state ||
      !formData.kennel.location.country
    ) {
      Alert.alert(
        localized('Error'),
        localized('Please fill in all required location fields')
      );
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...currentUser,
        kennel: formData.kennel,
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData(userData));
      router.push('/(onboarding)/(breeder)/breeds');
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
            justifyContent: 'center',
            backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$4' padding='$4'>
              <Text style={styles.stepIndicator}>
                {localized('Step')} {CURRENT_STEP} {localized('of')}{' '}
                {TOTAL_STEPS}
              </Text>

              <Text style={styles.title}>
                {localized('Tell us about your kennel')}
              </Text>

              <Text style={styles.caption}>
                {localized(
                  'This information will be shown to potential adopters'
                )}
              </Text>
            </YStack>

            <YStack gap='$4'>
              <YStack gap='$4'>
                <YStack gap='$2'>
                  {/* <Text>{localized('Kennel Name')}*</Text> */}
                  <XGroup>
                    <XGroup.Item>
                      <Button disabled theme='active' icon={<Home />} />
                    </XGroup.Item>

                    <XGroup.Item>
                      <Input
                        flex={1}
                        value={formData.kennel.name}
                        onChangeText={(value) =>
                          handleInputChange('kennel', 'name', value)
                        }
                        placeholder={localized('Enter your kennel name')}
                        autoCapitalize='words'
                      />
                    </XGroup.Item>
                  </XGroup>
                </YStack>

                <YStack gap='$2'>
                  {/* <Text>{localized('Location')}*</Text> */}
                  <XGroup>
                    <XGroup.Item>
                      <Button disabled theme='active' icon={<MapPin />} />
                    </XGroup.Item>

                    <XGroup.Item>
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
                    </XGroup.Item>
                  </XGroup>
                </YStack>

                <YStack gap='$2'>
                  {/* <Text>{localized('Registration Number')}</Text> */}
                  <XGroup>
                    <XGroup.Item>
                      <Button disabled theme='active' icon={<Copyright />} />
                    </XGroup.Item>

                    <XGroup.Item>
                      <Input
                        flex={1}
                        value={formData.kennel.registrationNumber}
                        onChangeText={(value) =>
                          handleInputChange(
                            'kennel',
                            'registrationNumber',
                            value
                          )
                        }
                        placeholder={localized(
                          'Enter registration number (optional)'
                        )}
                      />
                    </XGroup.Item>
                  </XGroup>
                </YStack>
                {/* 
                <YStack gap='$2'>
                  <Text>{localized('Description')}*</Text>
                  <Input
                    value={formData.kennel.description}
                    onChangeText={(value) =>
                      handleInputChange('kennel', 'description', value)
                    }
                    placeholder={localized(
                      'Tell us about your breeding program'
                    )}
                    multiline
                    numberOfLines={4}
                    textAlignVertical='top'
                  />
                </YStack> */}
              </YStack>

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

          <LocationSelector
            isLocationSheetOpen={isLocationSheetOpen}
            setIsLocationSheetOpen={setIsLocationSheetOpen}
            onChange={(location) =>
              handleInputChange('kennel', 'location', location)
            }
            currentLocation={currentUser?.kennel?.location}
          />
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

export default BasicInfoScreen;
