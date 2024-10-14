import React from 'react';
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
} from 'tamagui';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {useTheme} from '../../../dopebase';
import {X} from '@tamagui/lucide-icons';
import {useDispatch, useSelector} from 'react-redux';
import {
  toggleUsePreferences,
  updateFilter,
} from '../../../redux/reducers/filter';

interface BreedFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BreedFilterSheet: React.FC<BreedFilterSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const dispatch = useDispatch();
  const {usePreferences, breedGroup, lifeSpan, weight} = useSelector(
    (state: any) => state.filter
  );

  const handleUsePreferencesToggle = (value: boolean) => {
    dispatch(toggleUsePreferences(value));
  };

  const handleBreedGroupChange = (group: string) => {
    dispatch(updateFilter({breedGroup: group}));
  };

  const handleLifeSpanChange = (value: [number, number]) => {
    dispatch(updateFilter({lifeSpan: value}));
  };

  const handleWeightChange = (value: [number, number]) => {
    dispatch(updateFilter({weight: value}));
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={[90]}>
      <Sheet.Overlay />
      <Sheet.Frame backgroundColor={colorSet.primaryBackground}>
        <Sheet.Handle backgroundColor={colorSet.primaryForeground} />
        <YStack flex={1}>
          <YStack
            position='absolute'
            top={0}
            left={0}
            right={0}
            zIndex={1}
            backgroundColor={colorSet.primaryBackground}
            paddingBottom='$1'
          >
            <XStack
              justifyContent='space-between'
              alignItems='center'
              paddingHorizontal='$4'
            >
              <Text
                fontSize='$8'
                fontWeight='bold'
                color={colorSet.primaryForeground}
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
          </YStack>

          <ScrollView marginTop='$4'>
            <YStack paddingBottom='$12' gap='$4'>
              <Text
                fontSize='$6'
                fontWeight='bold'
                color={colorSet.primaryForeground}
              >
                Filter Breeds
              </Text>

              <Switch
                checked={usePreferences}
                onCheckedChange={handleUsePreferencesToggle}
              >
                <Text>Use Profile Preferences</Text>
              </Switch>
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
              onPress={() => onOpenChange(false)}
              backgroundColor={colorSet.primaryForeground}
              color={colorSet.primaryBackground}
              size='$4'
            >
              Apply Filters
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
