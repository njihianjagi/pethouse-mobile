import {useState} from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface ContactForm {
  id: string;
  seekerId: string;
  breederId: string;
  litterId: string;
  submittedDate: FirebaseFirestoreTypes.Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  contractSignedDate?: FirebaseFirestoreTypes.Timestamp;
  contractUrl?: string;
  formData: {
    [key: string]: any; // Flexible schema for form fields
  };
  modTime?: FirebaseFirestoreTypes.Timestamp;
}

export const useContactFormData = () => {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async (params: {
    seekerId?: string;
    breederId?: string;
    litterId?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('contactForms');

      if (params.seekerId) {
        query = query.where('seekerId', '==', params.seekerId);
      }
      if (params.breederId) {
        query = query.where('breederId', '==', params.breederId);
      }
      if (params.litterId) {
        query = query.where('litterId', '==', params.litterId);
      }
      if (params.status) {
        query = query.where('status', '==', params.status);
      }

      const snapshot = await query.get();
      const fetchedForms = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ContactForm)
      );

      setForms(fetchedForms);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching contact forms:', err);
    }
    setLoading(false);
  };

  return {
    forms,
    loading,
    error,
    fetchForms,
  };
};
