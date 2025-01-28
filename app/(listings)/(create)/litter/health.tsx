import React from 'react';
import {YStack, XStack, Text, Card, Switch, Button} from 'tamagui';
import {useTranslations} from '../../../../dopebase';
import {useRouter} from 'expo-router';
import {useLitterForm} from '../../../../hooks/useLitterForm';
import {Check, X} from '@tamagui/lucide-icons';

const HEALTH_TESTS = [
  {id: 'dna', label: 'DNA Testing'},
  {id: 'hips', label: 'Hip Evaluation'},
  {id: 'eyes', label: 'Eye Examination'},
  {id: 'heart', label: 'Cardiac Evaluation'},
] as const;

const VACCINATIONS = [
  {
    type: 'dhpp_1',
    label: 'DHPP (1st)',
    description: 'Distemper, Hepatitis, Parainfluenza, Parvovirus',
    weekAfterBirth: 6,
    required: true,
  },
  {
    type: 'dhpp_2',
    label: 'DHPP (2nd)',
    description: 'Distemper, Hepatitis, Parainfluenza, Parvovirus',

    weekAfterBirth: 8,
    required: true,
  },
  {
    type: 'dhpp_3',
    label: 'DHPP (3rd)',
    description: 'Distemper, Hepatitis, Parainfluenza, Parvovirus',

    weekAfterBirth: 12,
    required: true,
  },
  {
    type: 'bordetella',
    label: 'Bordetella',
    description: 'Kennel Cough',
    weekAfterBirth: 8,
    required: false,
  },
] as const;

export default function HealthStep() {
  const {localized} = useTranslations();
  const router = useRouter();
  const {formData, handleChange, validateStep} = useLitterForm();

  const getScheduledDate = (weekAfterBirth: number) => {
    if (!formData.actualDate) return null;
    const date = new Date(formData.actualDate);
    date.setDate(date.getDate() + weekAfterBirth * 7);
    return date;
  };

  const handleVaccinationToggle = (
    vaccination: (typeof VACCINATIONS)[number],
    completed: boolean
  ) => {
    const existingVaccinations = formData.health?.vaccinations || [];
    const vaccinationIndex = existingVaccinations.findIndex(
      (v) => v.type === vaccination.type
    );

    if (vaccinationIndex === -1) {
      // Add new vaccination record
      handleChange('health.vaccinations', [
        ...existingVaccinations,
        {
          type: vaccination.type,
          label: vaccination.label,
          description: vaccination.description,
          dueDate:
            getScheduledDate(vaccination.weekAfterBirth)?.toISOString() || '',
          completed,
          completedDate: completed ? new Date().toISOString() : undefined,
        },
      ]);
    } else {
      // Update existing vaccination
      const updatedVaccinations = [...existingVaccinations];
      updatedVaccinations[vaccinationIndex] = {
        ...updatedVaccinations[vaccinationIndex],
        completed,
        completedDate: completed ? new Date().toISOString() : undefined,
      };
      handleChange('health.vaccinations', updatedVaccinations);
    }
  };

  return (
    <YStack gap='$4' padding='$4'>
      {/* Parent Health Testing Section */}
      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Parent Health Testing')}
          </Text>

          {HEALTH_TESTS.map((test) => (
            <XStack
              key={test.id}
              justifyContent='space-between'
              alignItems='center'
            >
              <Text>{localized(test.label)}</Text>
              <Switch
                checked={formData.health?.[test.id]}
                onCheckedChange={(checked) =>
                  handleChange(`health.${test.id}`, checked)
                }
              />
            </XStack>
          ))}

          <YStack gap='$2'>
            <Text fontSize='$4'>{localized('Health Certificates')}</Text>
            {formData.health?.certificates?.map((cert, index) => (
              <XStack key={index} gap='$2' alignItems='center'>
                <Text flex={1}>{cert}</Text>
                <Button
                  icon={X}
                  onPress={() => {
                    const newCerts = [...(formData.health?.certificates || [])];
                    newCerts.splice(index, 1);
                    handleChange('health.certificates', newCerts);
                  }}
                  theme='red'
                />
              </XStack>
            ))}
          </YStack>
        </YStack>
      </Card>

      {/* Puppy Vaccination Schedule */}
      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Vaccination Schedule')}
          </Text>

          {!formData.actualDate ? (
            <Text color='$gray10'>
              {localized('Please set birth date to view vaccination schedule')}
            </Text>
          ) : formData.status !== 'born' ? (
            <Text color='$gray10'>
              {localized('Vaccination schedule will be available after birth')}
            </Text>
          ) : (
            <YStack gap='$4'>
              {VACCINATIONS.map((vaccination) => {
                const record = formData.health?.vaccinations?.find(
                  (v) => v.type === vaccination.type
                );
                const dueDate = getScheduledDate(vaccination.weekAfterBirth);
                const isOverdue = dueDate && dueDate <= new Date();

                return (
                  <XStack
                    key={vaccination.type}
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <YStack flex={1}>
                      <Text fontWeight='bold'>{vaccination.label}</Text>
                      {vaccination.description && (
                        <Text fontSize='$3' color='$gray10'>
                          {vaccination.description}
                        </Text>
                      )}
                      <Text
                        fontSize='$3'
                        color={isOverdue ? '$red10' : '$gray10'}
                      >
                        {localized('Due')}: {dueDate?.toLocaleDateString()}
                      </Text>
                    </YStack>
                    <Switch
                      checked={record?.completed}
                      onCheckedChange={(completed) =>
                        handleVaccinationToggle(vaccination, completed)
                      }
                    />
                  </XStack>
                );
              })}
            </YStack>
          )}
        </YStack>
      </Card>

      <Button
        theme='active'
        onPress={() => router.push('/litter/requirements')}
        disabled={!validateStep('health')}
      >
        {localized('Continue')}
      </Button>
    </YStack>
  );
}
