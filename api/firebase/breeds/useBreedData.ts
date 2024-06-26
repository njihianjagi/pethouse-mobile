import { useState } from 'react';
import { db } from '../../../firebase/config'; // Adjust the path as necessary

const useBreedsData = (kennelId) => {
  const [allBreeds, setAllBreeds] = useState([] as any);
  const [kennelBreeds, setKennelBreeds] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all breeds
  const fetchAllBreeds = async () => {
    setLoading(true);
    try {
      const response = await db.collection('breeds').get();
      const breedsData: any = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllBreeds(breedsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching all breeds:", err);
    }
    setLoading(false);
  };

  // Fetch all breeds for a specific kennel
  const fetchKennelBreeds = async () => {
    if (!kennelId) return;
    setLoading(true);
    try {
      const response = await db.collection('kennel_breeds').where('kennel_id', '==', kennelId).get();
      const kennelBreedsData: any = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setKennelBreeds(kennelBreedsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching kennel breeds:", err);
    }
    setLoading(false);
  };

  // Add a new breed to a kennel
  const addKennelBreed = async (breed) => {
    if (!kennelId) return;
    try {
      const response = await db.collection('kennel_breeds').add({ ...breed, kennel_id: kennelId });
      setKennelBreeds(prev => [...prev, { ...breed, id: response.id }]);
    } catch (err: any) {
      setError(err.message);
      console.error("Error adding kennel breed:", err);
    }
  };

  // Update an existing breed
  const updateKennelBreed = async (id, updatedData) => {
    try {
      await db.collection('kennel_breeds').doc(id).update(updatedData);
      setKennelBreeds(prev => prev.map(breed => breed.id === id ? { ...breed, ...updatedData } : breed));
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating kennel breed:", err);
    }
  };

  // Delete a breed
  const deleteKennelBreed = async (id) => {
    try {
      await db.collection('kennel_breeds').doc(id).delete();
      setKennelBreeds(prev => prev.filter(breed => breed.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting kennel breed:", err);
    }
  };


  return { allBreeds, kennelBreeds, loading, error, addKennelBreed, updateKennelBreed, deleteKennelBreed, fetchKennelBreeds, fetchAllBreeds };
};

export default useBreedsData;