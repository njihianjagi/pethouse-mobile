import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {YStack, Form, Button, Spinner, Tabs, Text} from 'tamagui';
import {Alert} from 'react-native';
import {
  SeekerProfile,
  updateUser,
} from '../../../api/firebase/users/userClient';
import {useTranslations} from '../../../dopebase';
import {HousingTab} from './housing';
import useCurrentUser from '../../../hooks/useCurrentUser';

const ONBOARDING_STEPS = {
  HOUSING: {
    title: 'Living Situation',
    subtitle: 'Tell us about your home',
    isRequired: true,
  },
  HOUSEHOLD: {
    title: 'Household',
    subtitle: 'Tell us about your family',
    isRequired: true,
  },
  EXPERIENCE: {
    title: 'Pet Experience',
    subtitle: 'Tell us about your experience with pets',
    isRequired: true,
  },
  PREFERENCES: {
    title: 'Preferences',
    subtitle: 'What are you looking for?',
    isRequired: true,
  },
};

export default function SeekerOnboardingScreen() {
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('HOUSING');
  const [formData, setFormData] = useState<SeekerProfile>({
    id: currentUser.id,
    email: currentUser.email,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    location: {} as any,
    status: 'active',
    role: 'seeker',
    references: [],
    housing: {
      type: 'own',
      propertyType: 'house',
      yard: {
        hasYard: false,
      },
      movingPlans: false,
    },
    household: {
      adults: 1,
      children: 0,
      hasAllergies: false,
      familyAgreement: false,
    },
    experience: {
      currentPets: [],
      previousPets: [],
      dogExperience: 'first_time',
    },
    preferences: {
      breedPreferences: [],
      ageRange: {min: 0, max: 15},
      gender: 'either',
      timeline: 'immediate',
      priceRange: {min: 0, max: 5000},
    },
    lifestyle: {
      workSchedule: 'work_from_home',
      hoursAlonePerDay: 2,
      activityLevel: 'moderate',
      travelFrequency: 'rarely',
    },
    veterinary: {
      hasVeterinarian: false,
    },
    profileComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateUser(currentUser.id, {
        role: 'seeker',
        seekerProfile: formData,
        profileComplete: true,
      });
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1]);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <YStack f={1} p='$4'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          flexGrow={1}
          gap='$4'
        >
          <Tabs.List>
            {Object.entries(ONBOARDING_STEPS).map(([key, {title}]) => (
              <Tabs.Tab key={key} value={key} flex={1}>
                <Text>{localized(title)}</Text>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Content value='HOUSING'>
            <HousingTab
              formData={formData.housing}
              onChange={(field, value) =>
                setFormData((prev) => ({
                  ...prev,
                  housing: {...prev.housing, [field]: value},
                }))
              }
            />
          </Tabs.Content>

          {/* Similar pattern for other tabs */}
        </Tabs>

        <YStack gap='$4' pt='$4'>
          <Form.Trigger asChild>
            <Button
              theme='active'
              icon={loading ? () => <Spinner /> : undefined}
              disabled={loading}
            >
              {loading
                ? ''
                : activeTab === 'PREFERENCES'
                ? localized('Complete')
                : localized('Next')}
            </Button>
          </Form.Trigger>
        </YStack>
      </YStack>
    </Form>
  );
}
