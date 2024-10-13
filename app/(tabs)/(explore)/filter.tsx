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

interface BreedFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BreedFilterSheet: React.FC<BreedFilterSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const {traitCategories, traitPreferences, handleTraitToggle} =
    useBreedSearch();

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const renderTraitOption = (option) => {
    if (option.type === 'switch') {
      return (
        <ListItem key={option.name}>
          <ListItem.Text>{option.label}</ListItem.Text>
          <Switch
            backgroundColor={
              !!traitPreferences[option.name] ? colorSet.grey3 : colorSet.grey0
            }
            checked={!!traitPreferences[option.name]}
            onCheckedChange={(value) => handleTraitToggle(option.name, value)}
          >
            <Switch.Thumb
              animation='quicker'
              backgroundColor={colorSet.primaryForeground}
            />
          </Switch>
        </ListItem>
      );
    } else if (option.type === 'toggle') {
      return (
        <ListItem key={option.name} width='100%'>
          <YStack flex={1} gap='$4'>
            <ListItem.Text>
              {option.name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </ListItem.Text>
            <ToggleGroup
              type='single'
              value={traitPreferences[option.name]?.toString()}
              onValueChange={(value) =>
                handleTraitToggle(option.name, parseInt(value))
              }
              flex={1}
            >
              {option.values.map((value, index) => (
                <ToggleGroup.Item key={value} value={index.toString()} flex={1}>
                  <Text color={colorSet.primaryText}>{value}</Text>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </YStack>
        </ListItem>
      );
    }
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
              {traitCategories.map((category) => (
                <YGroup key={category.name} bordered>
                  <YGroup.Item>
                    <ListItem
                      title={category.name}
                      subTitle={category.caption}
                    />
                  </YGroup.Item>
                  {category.options.map(renderTraitOption)}

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
