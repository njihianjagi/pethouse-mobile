import {YStack, XStack, Input, Select, Text} from 'tamagui';

const PricingStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <YStack gap='$2'>
      <Text>{localized('Price Structure')}</Text>
      <XStack gap='$4'>
        <Input
          flex={1}
          value={formData.price?.base?.toString()}
          onChangeText={(value) =>
            onChange('price', {
              ...formData.price,
              base: parseInt(value) || 0,
            })
          }
          keyboardType='numeric'
          placeholder={localized('Base Price')}
        />
        <Input
          flex={1}
          value={formData.price?.withRegistration?.toString()}
          onChangeText={(value) =>
            onChange('price', {
              ...formData.price,
              withRegistration: parseInt(value) || 0,
            })
          }
          keyboardType='numeric'
          placeholder={localized('With Registration')}
        />
      </XStack>
      <Input
        value={formData.price?.deposit?.toString()}
        onChangeText={(value) =>
          onChange('price', {
            ...formData.price,
            deposit: parseInt(value) || 0,
          })
        }
        keyboardType='numeric'
        placeholder={localized('Required Deposit')}
      />
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Registration')}</Text>
      <Select
        value={formData.registration?.type}
        onValueChange={(value) =>
          onChange('registration', {
            ...formData.registration,
            type: value,
          })
        }
      >
        <Select.Item index={0} value='limited'>
          {localized('Limited Only')}
        </Select.Item>
        <Select.Item index={1} value='full'>
          {localized('Full Only')}
        </Select.Item>
        <Select.Item index={2} value='both'>
          {localized('Both Available')}
        </Select.Item>
      </Select>
      <Input
        value={formData.registration?.organization}
        onChangeText={(value) =>
          onChange('registration', {
            ...formData.registration,
            organization: value,
          })
        }
        placeholder={localized('Registration Organization (AKC, etc)')}
      />
    </YStack>
  </YStack>
);

export default PricingStep;
