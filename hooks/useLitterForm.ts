import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from 'expo-router';
import useCurrentUser from './useCurrentUser';
import {
  HEALTH_SCHEDULES,
  LitterListing,
  useListingData,
} from '../api/firebase/listings/useListingData';

const STORAGE_KEY = 'LITTER_FORM_DRAFT';

export const useLitterForm = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [formData, setFormData] = useState<Partial<LitterListing>>({
    // Base listing fields
    userId: currentUser?.id,
    type: 'litter',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: '',

    // Litter specific fields
    breed: {
      breedId: '',
      breedName: '',
    },
    status: 'upcoming',
    puppyCount: {
      male: 0,
      female: 0,
      available: 0,
      reserved: 0,
    },
    price: {
      base: 0,
      deposit: 0,
      depositRefundable: true,
    },
    registration: {
      type: 'limited',
      organization: 'AKC',
    },
    health: {
      dna: false,
      hips: false,
      eyes: false,
      heart: false,
      certificates: [],
      vaccinations: [],
      dewormings: [],
      vetChecks: [],
    },
    requirements: {
      application: false,
      contract: false,
      spayNeuter: false,
      returnPolicy: false,
      homeCheck: false,
      references: false,
      experience: false,
      yard: false,
      fence: false,
      otherPets: 'allowed',
      children: 'allowed',
    },
    media: {
      images: [],
      videos: [],
    },
    description: '',
  });
  // Load saved draft
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setFormData(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    };
    loadDraft();
  }, []);

  // Save draft on changes
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (err) {
        console.error('Error saving draft:', err);
      }
    };
    saveDraft();
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = {...prev};
      const fieldPath = field.split('.');
      let current = newData as any;

      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;

      return newData;
    });
  };

  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'basic-info':
        return !!(formData.breed?.breedId && formData.expectedDate);

      case 'parents':
        const sire = formData.parents?.sire;
        const dam = formData.parents?.dam;
        return !!(
          sire?.name &&
          sire?.registration &&
          sire?.registryType &&
          sire?.breed?.id &&
          dam?.name &&
          dam?.registration &&
          dam?.registryType &&
          dam?.breed?.id
        );

      case 'health':
        // Parent health testing validation
        const requiredHealthTests = ['dna', 'hips', 'eyes', 'heart'];
        const hasRequiredTests = requiredHealthTests.every(
          (test) => formData.health?.[test]
        );

        // Vaccination schedule validation
        const requiredVaccinations = HEALTH_SCHEDULES.vaccinations
          .filter((v) => v.required)
          .map((v) => v.type);

        const hasRequiredVaccinations =
          formData.status !== 'born' ||
          requiredVaccinations.every((type) => {
            const vaccination: any = formData.health?.vaccinations?.find(
              (v) => v.type === type
            );
            const dueDate = vaccination?.dueDate
              ? new Date(vaccination.dueDate)
              : null;
            return dueDate
              ? dueDate > new Date() || vaccination.completed
              : false;
          });

        // Deworming schedule validation
        const requiredDewormings = HEALTH_SCHEDULES.dewormings
          .filter((d) => d.required)
          .map((d) => d.type);

        const hasRequiredDewormings =
          formData.status !== 'born' ||
          requiredDewormings.every((type) => {
            const deworming: any = formData.health?.dewormings?.find(
              (d) => d.type === type
            );
            const dueDate = deworming?.dueDate
              ? new Date(deworming.dueDate)
              : null;
            return dueDate
              ? dueDate > new Date() || deworming.completed
              : false;
          });

        // Vet check validation
        const requiredChecks: any = HEALTH_SCHEDULES.vetChecks
          .filter((v) => v.required)
          .map((v) => v.type);

        const hasRequiredChecks: any =
          formData.status !== 'born' ||
          requiredChecks.every((type) => {
            const check: any = formData.health?.vetChecks?.find(
              (v) => v.type === type
            );
            const dueDate = check?.dueDate ? new Date(check.dueDate) : null;
            return dueDate ? dueDate > new Date() || check.completed : false;
          });

        return (
          hasRequiredTests &&
          hasRequiredVaccinations &&
          hasRequiredDewormings &&
          hasRequiredChecks
        );

      case 'requirements':
        const requiredFields = [
          'application',
          'contract',
          'spayNeuter',
          'returnPolicy',
        ];
        return requiredFields.every((field) => formData.requirements?.[field]);

      default:
        return true;
    }
  };

  const clearDraft = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setFormData({});
  };

  const initializeHealthSchedule = (birthDate: Date) => {
    const calculateDueDate = (schedule: {
      weekAfterBirth?: number;
      dayAfterBirth?: number;
    }) => {
      const dueDate = new Date(birthDate);
      if (schedule.dayAfterBirth) {
        dueDate.setDate(dueDate.getDate() + schedule.dayAfterBirth);
      } else if (schedule.weekAfterBirth) {
        dueDate.setDate(dueDate.getDate() + schedule.weekAfterBirth * 7);
      }
      return dueDate.toISOString();
    };

    return {
      vaccinations: HEALTH_SCHEDULES.vaccinations.map((schedule) => ({
        type: schedule.type,
        label: schedule.label,
        // description: schedule.description,
        dueDate: calculateDueDate(schedule),
        completed: false,
      })),

      dewormings: HEALTH_SCHEDULES.dewormings.map((schedule) => ({
        type: schedule.type,
        label: schedule.label,
        dueDate: calculateDueDate(schedule),
        completed: false,
        product: '',
      })),

      vetChecks: HEALTH_SCHEDULES.vetChecks.map((schedule) => ({
        type: schedule.type,
        label: schedule.label,
        dueDate: calculateDueDate(schedule),
        completed: false,
        weight: 0,
      })),
    };
  };

  // Watch for birth date changes to initialize schedules
  useEffect(() => {
    if (
      formData.actualDate &&
      formData.status === 'born' &&
      !formData.health?.vaccinations?.length
    ) {
      const schedules = initializeHealthSchedule(new Date(formData.actualDate));
      handleChange('health', {
        ...formData.health,
        ...schedules,
      });
    }
  }, [formData.actualDate, formData.status]);

  // Add after line 280, before the return statement

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate all steps
      const steps = [
        'basic-info',
        'media',
        'parents',
        'health',
        'requirements',
        'pricing',
      ];
      const isValid = steps.every((step) => validateStep(step));

      if (!isValid) {
        throw new Error('Please complete all required fields');
      }

      // Prepare listing data
      const listingData: LitterListing = {
        ...formData,
        updatedAt: new Date(),
        userId: currentUser?.id,
        type: 'litter',
      } as LitterListing;

      // Submit to backend
      const {addListing} = useListingData();
      await addListing(listingData);

      // Clear draft on success
      await clearDraft();

      // Navigate to success page
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to submit listing')
      );
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    validateStep,
    clearDraft,
    handleSubmit,
  };
};
