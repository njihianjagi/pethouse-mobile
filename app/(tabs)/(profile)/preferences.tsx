import React, {useEffect, useState} from 'react';
import {
  Sheet,
  YStack,
  XStack,
  Button,
  Text,
  Switch,
  ToggleGroup,
  ScrollView,
  ListItem,
  YGroup,
  Separator,
  View,
  Spinner,
} from 'tamagui';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {useTheme} from '../../../dopebase';
import {X} from '@tamagui/lucide-icons';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useRouter} from 'expo-router';
import {updateUser} from '../../../api/firebase/users/userClient';

export default function BreedPreferences() {
  const {traitGroups, traitPreferences, updateFilter} = useBreedSearch();

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  const currentUser = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [tempPreferences, setTempPreferences] = useState({...traitPreferences});
  const [isApplying, setIsApplying] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setTempPreferences({...currentUser.traitPreferences});
  }, [currentUser]);

  const handleTraitChange = (traitName: string, value: boolean) => {
    setTempPreferences((prev) => {
      const newPreferences = {...prev};
      if (!value) {
        // Remove the trait if it's being set to false
        delete newPreferences[traitName];
      } else {
        // Only add the trait if it's being set to true
        newPreferences[traitName] = value;
      }
      return newPreferences;
    });
  };

  const handleApplyFilters = async () => {
    try {
      setIsApplying(true);

      if (currentUser?.id) {
        const response: any = await updateUser(currentUser.id, {
          traitPreferences: tempPreferences,
        });

        if (response && response.user) {
          dispatch(
            setUserData({
              user: response.user,
            })
          );
        }
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      // Optionally show error toast/alert here
    } finally {
      updateFilter('traitPreferences', tempPreferences);
      setIsApplying(false);
      router.back();
    }
  };

  // const renderTraitOption = (option) => {
  //   if (option.type === 'switch') {
  //     return (
  //       <ListItem key={option.name}>
  //         <ListItem.Text>{option.label}</ListItem.Text>
  //         <Switch
  //           backgroundColor={
  //             !!traitPreferences[option.name] ? colorSet.grey3 : colorSet.grey0
  //           }
  //           checked={!!traitPreferences[option.name]}
  //           onCheckedChange={(value) =>
  //             updateFilter('traitPreferences', {[option.name]: value})
  //           }
  //         >
  //           <Switch.Thumb
  //             animation='quicker'
  //             backgroundColor={colorSet.primaryForeground}
  //           />
  //         </Switch>
  //       </ListItem>
  //     );
  //   } else if (option.type === 'toggle') {
  //     return (
  //       <ListItem key={option.name} width='100%'>
  //         <YStack flex={1} gap='$4'>
  //           <ListItem.Text>
  //             {option.name
  //               .replace(/_/g, ' ')
  //               .replace(/\b\w/g, (l) => l.toUpperCase())}
  //           </ListItem.Text>
  //           <ToggleGroup
  //             type='single'
  //             value={traitPreferences[option.name]?.toString()}
  //             onValueChange={(value) =>
  //               updateFilter('traitPreferences', {
  //                 [option.name]: parseInt(value),
  //               })
  //             }
  //             flex={1}
  //           >
  //             {option.values.map((value, index) => (
  //               <ToggleGroup.Item key={value} value={index.toString()} flex={1}>
  //                 <Text color={colorSet.primaryText}>{value}</Text>
  //               </ToggleGroup.Item>
  //             ))}
  //           </ToggleGroup>
  //         </YStack>
  //       </ListItem>
  //     );
  //   }
  // };

  const renderTraitOption = (trait) => (
    <ListItem key={trait.name}>
      <ListItem.Text>{trait.name}</ListItem.Text>
      <Switch
        backgroundColor={
          !!tempPreferences[trait.name]
            ? colorSet.secondaryForeground
            : '$gray3'
        }
        checked={!!tempPreferences[trait.name]}
        onCheckedChange={(value) => handleTraitChange(trait.name, value)}
      >
        <Switch.Thumb
          animation='quicker'
          backgroundColor={
            !!tempPreferences[trait.name]
              ? colorSet.primaryForeground
              : '$gray6'
          }
        />
      </Switch>
    </ListItem>
  );

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      <YStack flex={1} width='100%' padding='$4'>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <ScrollView marginTop='$4'>
              <YStack marginBottom='$12' gap='$4'>
                {traitGroups.map((group) => (
                  <YGroup key={group.name} bordered>
                    <YGroup.Item>
                      <ListItem
                        title={<Text fontWeight='bold'>{group.name}</Text>}
                      />
                    </YGroup.Item>
                    <Separator />
                    {group.traits.map(renderTraitOption)}
                    <Separator />
                  </YGroup>
                ))}
              </YStack>
            </ScrollView>

            <YStack
              position='absolute'
              bottom={0}
              left={0}
              right={0}
              padding='$4'
              backgroundColor={colorSet.primaryBackground}
              borderBottomWidth={1}
              borderBottomColor={colorSet.secondaryBackground}
            >
              <Button
                onPress={handleApplyFilters}
                backgroundColor={colorSet.primaryForeground}
                color={colorSet.primaryBackground}
                size='$4'
              >
                {isApplying ? <Spinner /> : 'Apply Filters'}
              </Button>
            </YStack>
          </>
        )}
      </YStack>
    </View>
  );
}
