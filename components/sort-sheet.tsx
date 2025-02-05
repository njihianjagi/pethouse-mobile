import {Sheet, H4, YStack, XStack, Select} from 'tamagui';
import {Settings2} from '@tamagui/lucide-icons';

export interface SortOption {
  label: string;
  value: string;
}

export interface SortPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  options?: SortOption[];
}

const defaultOptions: SortOption[] = [
  {label: 'Relevance', value: 'relevance'},
  {label: 'Newest', value: 'created_at:desc'},
  {label: 'Oldest', value: 'created_at:asc'},
  {label: 'Name A-Z', value: 'name:asc'},
  {label: 'Name Z-A', value: 'name:desc'},
];

export function SortSheet({
  isOpen,
  onClose,
  value,
  onChange,
  options = defaultOptions,
}: SortPopoverProps) {
  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[40]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding='$4' space>
        <Sheet.Handle />
        <H4>Sort By</H4>
        <YStack space>
          <XStack space alignItems='center'>
            <Select value={value} onValueChange={onChange}>
              <Select.Trigger width='100%' iconAfter={Settings2}>
                <Select.Value placeholder='Sort by...' />
              </Select.Trigger>

              <Select.Content>
                <Select.ScrollUpButton />
                <Select.Viewport>
                  <Select.Group>
                    {options.map((option, index) => (
                      <Select.Item
                        key={option.value}
                        index={index}
                        value={option.value}
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
