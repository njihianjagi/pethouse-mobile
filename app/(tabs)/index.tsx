import React, {memo, useEffect, useLayoutEffect, useCallback} from 'react';
import {FlatList, ScrollView, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useTheme, useTranslations, TouchableIcon} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useAuth} from '../../hooks/useAuth';
import {StyleSheet} from 'react-native';
import {useNavigation, useRouter} from 'expo-router';
import {
  Text,
  View,
  XStack,
  Button,
  YStack,
  Input,
  Card,
  Paragraph,
  Image,
  H2,
} from 'tamagui';
import {
  MapPin,
  ListFilter,
  ArrowRight,
  Bell,
  LogOut,
} from '@tamagui/lucide-icons';
import {logout} from '../../api/firebase/auth/authClient';
import allBreeds from '../../assets/data/breeds_with_group_and_traits.json';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const currentUser = useCurrentUser();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  //const styles = dynamicStyles(theme, appearance)
  const colorSet = theme.colors[appearance];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: localized('Home'),
      headerRight: () => (
        <Button
          onPress={onLogout}
          chromeless
          icon={<LogOut size='$1' />}
          color={colorSet.primaryForeground}
          size='$4'
        />
      ),
      headerStyle: {
        backgroundColor: colorSet.primaryBackground,
        borderBottomColor: colorSet.hairline,
      },
      headerTintColor: colorSet.primaryText,
    });
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }
    console.log(currentUser);
  }, [currentUser?.id]);

  const onLogout = useCallback(() => {
    logout();
    router.push('/');
  }, []);

  const CardItem = ({breed}) => (
    <Card bordered flex={1} margin={5}>
      <Card.Header padded>
        <Text
          color={colorSet.primaryForeground}
          fontSize={24}
          fontWeight='bold'
        >
          {breed}
        </Text>
      </Card.Header>

      <Card.Footer padded>
        <XStack flex={1} />
        <Button
          borderRadius='$10'
          icon={<ArrowRight size='$2' color={colorSet.primaryForeground} />}
          chromeless
        ></Button>
      </Card.Footer>

      <Card.Background
        backgroundColor={colorSet.secondaryForeground}
        borderRadius={16}
      />
    </Card>
  );

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2'>
          <MapPin color={colorSet.primaryForeground} />
          <Text>
            {currentUser.location?.latitude}, {currentUser.location?.longitude}
          </Text>
        </XStack>

        <XStack gap='$2'>
          <Input flex={1} color={colorSet.secondaryText}>
            {localized('Search by breed')}
          </Input>

          <Button size='$4' theme='active' icon={ListFilter}></Button>
        </XStack>

        <XStack>
          <Text fontSize={24} fontWeight='bold'>
            Your matched breeds
          </Text>
        </XStack>

        <ScrollView>
          <FlatList
            data={currentUser?.preferredBreeds}
            renderItem={({item, index}) => (
              <XStack flex={1}>
                <CardItem breed={item} />
                {index % 2 === 0 &&
                  index + 1 < currentUser?.preferredBreeds.length && (
                    <CardItem breed={currentUser?.preferredBreeds[index + 1]} />
                  )}
              </XStack>
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={1}
            scrollEnabled={false}
          />
        </ScrollView>
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
