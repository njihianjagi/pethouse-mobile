import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {StyleSheet} from 'react-native';
import {
  YStack,
  XStack,
  Button,
  Text,
  View,
  Image,
  ScrollView,
  Spinner,
  Tabs,
  Separator,
  YGroup,
  ListItem,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {ChevronRight} from '@tamagui/lucide-icons';
import {TraitSelector} from '../../components/TraitSelector';
import {RecommendedBreeds} from '../../components/RecommendedBreeds';
import {useBreedSearch} from '../../hooks/useBreedSearch';

const OnboardingSteps = {
  tab1: {
    title: 'Welcome to Doghouse!',
    description:
      'Discover your ideal furry companion and start a journey of love and companionship.',
    cta: 'Get Started',
  },
  tab2: {
    title: 'Personal Preferences',
    description:
      'Tell us about your ideal pet. Your preferences will help us match you with the perfect companion.',
    cta: 'Set Preferences',
  },
  tab3: {
    title: 'Browse Breeds',
    description:
      'Explore a variety of breeds that match your preferences. Learn about their traits and personalities.',
    cta: 'Explore Breeds',
  },
};

const SeekerOnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {theme, appearance} = useTheme();
  const {localized} = useTranslations();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const [activeTab, setActiveTab] = useState('tab1');
  const [loading, setLoading] = useState(false);
  const [traitPreferences, setTraitPreferences] = useState({});

  const {allBreeds, filteredBreeds, updateFilter, traitGroups} =
    useBreedSearch();

  const tabs = ['tab1', 'tab2', 'tab3'];
  const currentIndex = tabs.indexOf(activeTab);

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleNext = async () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      // Save preferences and proceed to home
      try {
        setLoading(true);
        // Save preferences logic here
        router.push('/(tabs)');
      } catch (error) {
        console.error('Error saving preferences:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const updateTraitPreference = (trait: string, value: any) => {
    setTraitPreferences((prev) => ({
      ...prev,
      [trait]: value,
    }));
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      {loading ? (
        <Spinner
          size='large'
          color={theme.colors[appearance].primaryForeground}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$4' padding='$4'>
              <View style={styles?.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <Text style={styles.title}>
                Hey, {currentUser?.firstName || currentUser?.username}
              </Text>
              <Text style={styles.caption}>
                {OnboardingSteps[activeTab].description}
              </Text>
            </YStack>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              flexDirection='column'
              gap='$4'
            >
              <Tabs.List>
                {tabs.map((tab, index) => (
                  <Tabs.Trigger
                    key={tab}
                    value={tab}
                    flex={1}
                    backgroundColor={
                      activeTab === tab
                        ? colorSet.primaryForeground
                        : colorSet.grey0
                    }
                    borderRadius='$4'
                  >
                    <Text
                      color={
                        activeTab === tab
                          ? colorSet.primaryBackground
                          : colorSet.primaryForeground
                      }
                    >
                      Step {index + 1}
                    </Text>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value='tab1'>
                <YStack gap='$4' alignItems='center'>
                  <Text fontSize='$6' textAlign='center'>
                    {OnboardingSteps.tab1.title}
                  </Text>
                </YStack>
              </Tabs.Content>

              <Tabs.Content value='tab2'>
                {/* <TraitSelector
                  isOpen={false}
                  onClose={() => {}}
                  traitGroups={traitGroups}
                  traitPreferences={traitPreferences}
                  updateFilter={updateFilter}
                /> */}
              </Tabs.Content>

              <Tabs.Content value='tab3'>
                {/* <YStack gap='$4' alignItems='center'>
                  <Text fontSize='$6' textAlign='center'>
                    Based on your preferences, here are some breeds that might
                    be perfect for you:
                  </Text>
                  
                </YStack> */}

                <RecommendedBreeds
                  loading={loading}
                  filteredBreeds={filteredBreeds}
                  traitPreferences={traitPreferences}
                  updateFilter={updateFilter}
                  traitGroups={traitGroups}
                  onSelectBreed={(breed) => {
                    // Handle breed selection
                    router.push({
                      pathname: '/(explore)/[breed_name]',
                      params: {breed_name: breed.name},
                    });
                  }}
                />
              </Tabs.Content>
            </Tabs>

            <YStack gap='$4' paddingTop='$4'>
              <Button
                size='$5'
                theme='active'
                onPress={handleNext}
                iconAfter={ChevronRight}
              >
                {currentIndex === tabs.length - 1
                  ? 'Find Your Match'
                  : OnboardingSteps[activeTab].cta}
              </Button>

              {currentIndex > 0 && (
                <Button size='$4' chromeless onPress={handleBack}>
                  Back
                </Button>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      )}
    </View>
  );
};

export default SeekerOnboardingScreen;

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorSet.primaryBackground,
    },
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
    logo: {
      width: 'auto',
      height: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      width: 200,
      height: 150,
      resizeMode: 'contain',
      tintColor: '',
    },
  });
};
