import React, {useEffect} from 'react';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {StyleSheet} from 'react-native';
import {useNavigation, useRouter} from 'expo-router';
import {Text, View, XStack, YStack} from 'tamagui';
import {MapPin} from '@tamagui/lucide-icons';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const currentUser = useCurrentUser();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  //const styles = dynamicStyles(theme, appearance)
  const colorSet = theme.colors[appearance];

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }
  }, [currentUser?.id]);

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2'>
          <MapPin color={colorSet.primaryForeground} />
          <Text>
            {currentUser.location?.latitude}, {currentUser.location?.longitude}
          </Text>
        </XStack>

        <XStack></XStack>
      </YStack>
    </View>
  );
}

const dynamicStyles = (theme, appearance) => {
  const colorSet = theme.colors[appearance];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorSet.primaryBackground,
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: colorSet.primaryText,
      marginTop: 16,
      fontSize: 18,
    },
    image: {
      height: 128,
      width: 128,
      borderRadius: 64,
      marginTop: -320,
    },
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 20,
    backgroundColor: '#a2d2ff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubText: {
    fontSize: 16,
  },
  content: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    backgroundColor: '#ffafcc',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyCard: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  storyImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  storyText: {
    fontSize: 14,
    marginTop: 10,
  },
  petList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  petCard: {
    width: 150,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  petImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  petDetails: {
    fontSize: 14,
  },
  petDistance: {
    fontSize: 14,
  },
  navBar: {
    height: 50,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
