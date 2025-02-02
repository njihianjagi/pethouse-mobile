import * as admin from 'firebase-admin';
import breedsData from '../assets/data/breeds_with_group_and_traits.json';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(
    require('./doghouse-c77c1-firebase-adminsdk-bikxp-e5d8cc57bf.json')
  ),
});

const db = admin.firestore();

async function updateBreeds() {
  try {
    console.log('Starting breeds update...');
    const batch = db.batch();
    const breedsRef = db.collection('breeds');

    for (const breed of breedsData) {
      const querySnapshot = await breedsRef
        .where('name', '==', breed.name)
        .limit(1)
        .get();

      let docRef;
      if (querySnapshot.empty) {
        // Create new document with consistent ID format
        docRef = breedsRef.doc(breed.name.toLowerCase().replace(/\s+/g, '-'));
        console.log(`Creating new document for ${breed.name}`);
      } else {
        docRef = querySnapshot.docs[0].ref;
        console.log(`Updating existing document for ${breed.name}`);
      }

      const updateData = {
        name: breed.name,
        description: breed.description || null,
        height: breed.height || null,
        lifeSpan: breed.lifeSpan || null,
        ...(breed.weight && {weight: breed.weight}),
        ...(breed.image && {image: breed.image}),
        ...(breed.breedGroup && {breedGroup: breed.breedGroup}),
        ...(breed.traits && {traits: breed.traits}),
      };

      batch.set(docRef, updateData, {merge: true});
    }

    await batch.commit();
    console.log('Successfully updated all breeds!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating breeds:', error);
    process.exit(1);
  }
}

// Run the update
updateBreeds();
