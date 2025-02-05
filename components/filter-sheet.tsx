import React, {useEffect, useState} from 'react';
import {
  Sheet,
  YStack,
  XStack,
  Button,
  Text,
  ScrollView,
  ListItem,
  Separator,
  YGroup,
  Switch,
  Spinner,
} from 'tamagui';
import {useTheme} from '../dopebase';
import {X} from '@tamagui/lucide-icons';
import useCurrentUser from '../hooks/useCurrentUser';
import {updateUser} from '../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../redux/reducers/auth';

interface BreedFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traitGroups: any;
  traitPreferences: any;
  updateFilter: any;
  mode?: 'list' | 'steps'; // New prop to control display mode
  title?: string;
}

export const BreedFilterSheet: React.FC<BreedFilterSheetProps> = ({
  open,
  onOpenChange,
  traitGroups,
  traitPreferences,
  updateFilter,
  mode = 'steps', // Default to steps mode
  title = 'Select traits',
}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [tempPreferences, setTempPreferences] = useState({...traitPreferences});
  const [isApplying, setIsApplying] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (open) {
      setTempPreferences({...traitPreferences});
    }
  }, [open, traitPreferences]);

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
          ...currentUser,
          traitPreferences: tempPreferences,
        });

        console.log('response: ', response.user);
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
      onOpenChange(false);
    }
  };

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
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={[90]}>
      <Sheet.Overlay />
      <Sheet.Frame backgroundColor={colorSet.primaryBackground}>
        <Sheet.Handle backgroundColor={colorSet.primaryForeground} />
        <YStack flex={1}>
          <XStack justifyContent='space-between' alignItems='center'>
            <Text
              fontSize='$8'
              fontWeight='bold'
              color={colorSet.primaryForeground}
              paddingLeft='$4'
            >
              Filter Breeds
            </Text>
            <Button
              icon={<X size='$1' color={colorSet.primaryForeground} />}
              circular
              onPress={() => onOpenChange(false)}
              chromeless
            />
          </XStack>

          <ScrollView marginTop='$4'>
            <YStack padding='$4' marginBottom='$12' gap='$4'>
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
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
