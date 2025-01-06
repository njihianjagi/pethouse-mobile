import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {
  YStack,
  Text,
  XStack,
  Switch,
  Input,
  RadioGroup,
  View,
  ScrollView,
  Spinner,
  Button,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 3;

interface Facilities {
  type: 'home' | 'dedicated_facility' | 'both';
  details: string;
  hasWhelping: boolean;
  hasExerciseArea: boolean;
}

const FacilitiesScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const [facilities, setFacilities] = useState<Facilities>({
    type: 'home',
    details: '',
    hasWhelping: false,
    hasExerciseArea: false,
  });

  useEffect(() => {
    if (currentUser?.breeding?.facilities) {
      setFacilities(currentUser.breeding.facilities);
    }
  }, [currentUser]);

  const facilityTypes = [
    {value: 'home', label: 'Home Based'},
    {value: 'dedicated_facility', label: 'Dedicated Facility'},
    {value: 'both', label: 'Both'},
  ];

  const handleChange = (field: string, value: any) => {
    setFacilities((prev) => ({...prev, [field]: value}));
  };

  const handleContinue = async () => {
    if (!facilities.type || !facilities.details) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...currentUser,
        breeding: {
          ...currentUser?.breeding,
          facilities,
          onboardingComplete: true,
        },
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData(userData));
      router.replace('/(tabs)');
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
      // backgroundColor={colorSet.primaryBackground}
      flex={1}
    >
      {loading ? (
        <Spinner size='large' color={colorSet.primaryForeground} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            // backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$2' padding='$4'>
              <Text style={styles.stepIndicator}>
                {localized('Step')} {CURRENT_STEP} {localized('of')}{' '}
                {TOTAL_STEPS}
              </Text>

              <Text style={styles.title}>{localized('Your Facilities')}</Text>

              <Text style={styles.caption}>
                {localized('Tell us about your breeding facilities')}
              </Text>
            </YStack>

            <YStack gap='$4'>
              <YStack gap='$2'>
                <Text>{localized('Facility Type')}*</Text>
                <RadioGroup
                  value={facilities.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <YStack gap='$4' flexWrap='wrap'>
                    {facilityTypes.map((type) => (
                      <XStack>
                        <RadioGroup.Item
                          key={type.value}
                          value={type.value}
                          // size='$12'
                        >
                          <RadioGroup.Indicator />
                        </RadioGroup.Item>
                        <Text ml='$2'>{localized(type.label)}</Text>
                      </XStack>
                    ))}
                  </YStack>
                </RadioGroup>
              </YStack>

              <YStack gap='$2'>
                <Text>{localized('Facility Details')}*</Text>
                <Input
                  value={facilities.details}
                  onChangeText={(value) => handleChange('details', value)}
                  placeholder={localized('Describe your breeding facilities')}
                  multiline
                  numberOfLines={4}
                  textAlignVertical='top'
                />
              </YStack>

              <YStack gap='$2'>
                <Text>{localized('Additional Features')}</Text>
                <XStack gap='$4' flexWrap='wrap'>
                  <XStack gap='$2' ai='center'>
                    <Switch
                      checked={facilities.hasWhelping}
                      onCheckedChange={(checked) =>
                        handleChange('hasWhelping', checked)
                      }
                    />
                    <Text>{localized('Whelping Area')}</Text>
                  </XStack>
                  <XStack gap='$2' ai='center'>
                    <Switch
                      checked={facilities.hasExerciseArea}
                      onCheckedChange={(checked) =>
                        handleChange('hasExerciseArea', checked)
                      }
                    />
                    <Text>{localized('Exercise Area')}</Text>
                  </XStack>
                </XStack>
              </YStack>

              <Button
                backgroundColor={colorSet.secondaryForeground}
                color={colorSet.primaryForeground}
                onPress={handleContinue}
                disabled={!facilities.type || !facilities.details || loading}
              >
                {loading ? localized('Please wait...') : localized('Complete')}
              </Button>
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

export default FacilitiesScreen;
