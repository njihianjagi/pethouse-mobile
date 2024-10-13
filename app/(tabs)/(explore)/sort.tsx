import React, {useState} from 'react';
import {Popover, YStack, View, Text, Button, YGroup} from 'tamagui';
import {ChevronDown} from '@tamagui/lucide-icons';

export const SortPopover = ({sortOption, handleSortChange}) => {
  const [open, setOpen] = useState(false);

  const handleSort = (option) => {
    handleSortChange(option);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement='bottom' offset={60}>
      <Popover.Trigger asChild>
        <Button icon={ChevronDown} size='$3'>
          {sortOption === 'nameAsc'
            ? 'Name (A-Z)'
            : sortOption === 'nameDesc'
            ? 'Name (Z-A)'
            : sortOption === 'popular'
            ? 'Popular'
            : sortOption === 'available'
            ? 'Available'
            : 'Sort'}
        </Button>
      </Popover.Trigger>
      <Popover.Content padding={0}>
        <YGroup>
          <YGroup.Item>
            <Button onPress={() => handleSort('nameAsc')} size='$3'>
              Sort by Name (A-Z)
            </Button>
          </YGroup.Item>
          <YGroup.Item>
            <Button onPress={() => handleSort('nameDesc')} size='$3'>
              Sort by Name (Z-A)
            </Button>
          </YGroup.Item>
          <YGroup.Item>
            <Button onPress={() => handleSort('popular')} size='$3'>
              Sort by Popularity
            </Button>
          </YGroup.Item>
          <YGroup.Item>
            <Button onPress={() => handleSort('available')} size='$3'>
              Sort by Availability
            </Button>
          </YGroup.Item>
        </YGroup>
      </Popover.Content>
    </Popover>
  );
};
