import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {
  YStack,
  Text,
  Button,
  View,
  Spinner,
  YGroup,
  ListItem,
  Separator,
} from 'tamagui';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useTheme, useTranslations} from '../../dopebase';
import {Image} from 'react-native';
import {updateUser} from '../../api/firebase/users/userClient';
import {Dog, UserRound, Circle, CircleCheck} from '@tamagui/lucide-icons';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../redux/reducers/auth';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'breeder' | 'seeker' | null>(
    null
  );

  const handleContinue = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      const userData = {
        ...currentUser,
        role: selectedRole,
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData(userData));

      console.log('selected role: ', selectedRole);
      router.push(
        selectedRole === 'breeder'
          ? '/(onboarding)/(breeder)'
          : '/(onboarding)/(seeker)'
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error updating user role:', error);
    }
  };

  const roles = [
    {
      id: 'breeder',
      title: localized('Breeder'),
      subtitle: localized('I want to list my puppies'),
      icon: Dog,
    },
    {
      id: 'seeker',
      title: localized('Seeker'),
      subtitle: localized('I want to find a puppy'),
      icon: UserRound,
    },
  ];

  return (
    <View
      flex={1}
      backgroundColor={colorSet.primaryBackground}
      alignItems='center'
      justifyContent='center'
    >
      <YStack
        padding='$8'
        gap='$4'
        maxWidth={500}
        width='100%'
        alignItems='center'
      >
        <View
          width='auto'
          height='auto'
          justifyContent='center'
          alignItems='center'
        >
          <Image
            source={theme.icons?.logo}
            style={{
              width: 200,
              height: 150,
              resizeMode: 'contain',
            }}
          />
        </View>

        <Text
          fontSize={40}
          fontWeight='bold'
          color={colorSet.primaryForeground}
          textAlign='center'
          marginTop={0}
          marginBottom={0}
        >
          {localized("Let's Get Started!")}
        </Text>

        <Text
          fontSize={16}
          lineHeight={24}
          textAlign='center'
          color={colorSet.primaryForeground}
        >
          {localized(
            'Before you continue, please tell us whether you are searching for a new dog or you would like to rehome your current dog.'
          )}
        </Text>

        <YGroup
          backgroundColor={colorSet.secondaryBackground}
          width='100%'
          overflow='hidden'
          borderRadius='$4'
          bordered
        >
          {roles.map((role) => (
            <YGroup.Item key={role.id}>
              <ListItem
                hoverTheme
                pressTheme
                title={role.title}
                subTitle={role.subtitle}
                icon={role.icon}
                iconAfter={
                  selectedRole === role.id ? (
                    <CircleCheck color={colorSet.primaryForeground} size={24} />
                  ) : (
                    <Circle color='$gray6' size={24} />
                  )
                }
                onPress={() => setSelectedRole(role.id as 'breeder' | 'seeker')}
                backgroundColor={
                  selectedRole === role.id
                    ? colorSet.grey0
                    : colorSet.secondaryBackground
                }
              />
              <Separator />
            </YGroup.Item>
          ))}
        </YGroup>

        <Button
          marginTop='$4'
          theme='active'
          disabled={!selectedRole || loading}
          onPress={handleContinue}
          width='100%'
          backgroundColor={colorSet.secondaryForeground}
        >
          {loading ? (
            <Spinner color={colorSet.primaryForeground} />
          ) : (
            localized('Continue')
          )}
        </Button>
      </YStack>
    </View>
  );
}
