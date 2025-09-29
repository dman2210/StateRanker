import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';
import { z } from 'zod';

// Firestore data models
const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().optional(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CriteriaSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number(),
  color: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const RatingSchema = z.object({
  id: z.string(),
  stateCode: z.string(),
  criteriaId: z.string(),
  userId: z.string(),
  value: z.number().min(1).max(10),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserData = z.infer<typeof UserSchema>;
export type CriteriaData = z.infer<typeof CriteriaSchema>;
export type RatingData = z.infer<typeof RatingSchema>;

// User operations
export async function createOrUpdateUser(firebaseUser: User): Promise<UserData> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  
  const userData: Omit<UserData, 'id'> = {
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
    email: firebaseUser.email || undefined,
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: userDoc.exists() ? userDoc.data().createdAt.toDate() : new Date(),
    updatedAt: new Date(),
  };

  await updateDoc(userRef, {
    ...userData,
    createdAt: userDoc.exists() ? userDoc.data().createdAt : Timestamp.fromDate(userData.createdAt),
    updatedAt: Timestamp.fromDate(userData.updatedAt),
  }).catch(async () => {
    // Document doesn't exist, create it
    await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: Timestamp.fromDate(userData.createdAt),
      updatedAt: Timestamp.fromDate(userData.updatedAt),
    });
  });

  return { ...userData, id: firebaseUser.uid };
}

export async function getUser(userId: string): Promise<UserData | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    id: userDoc.id,
    username: data.username,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

// Criteria operations
export async function getUserCriteria(userId: string): Promise<CriteriaData[]> {
  const q = query(
    collection(db, 'criteria'), 
    where('userId', '==', userId),
    orderBy('name')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as CriteriaData[];
}

export async function createCriteria(criteria: Omit<CriteriaData, 'id' | 'createdAt' | 'updatedAt'>): Promise<CriteriaData> {
  const now = new Date();
  const docRef = await addDoc(collection(db, 'criteria'), {
    ...criteria,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  return {
    id: docRef.id,
    ...criteria,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCriteria(id: string, updates: Partial<Omit<CriteriaData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const criteriaRef = doc(db, 'criteria', id);
  await updateDoc(criteriaRef, {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function deleteCriteria(id: string): Promise<void> {
  await deleteDoc(doc(db, 'criteria', id));
}

// Rating operations
export async function getUserRatings(userId: string): Promise<RatingData[]> {
  const q = query(
    collection(db, 'ratings'), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as RatingData[];
}

export async function createOrUpdateRating(rating: Omit<RatingData, 'id' | 'createdAt' | 'updatedAt'>): Promise<RatingData> {
  // Check if rating already exists for this user, state, and criteria
  const q = query(
    collection(db, 'ratings'),
    where('userId', '==', rating.userId),
    where('stateCode', '==', rating.stateCode),
    where('criteriaId', '==', rating.criteriaId)
  );
  
  const querySnapshot = await getDocs(q);
  const now = new Date();

  if (!querySnapshot.empty) {
    // Update existing rating
    const existingDoc = querySnapshot.docs[0];
    await updateDoc(existingDoc.ref, {
      value: rating.value,
      updatedAt: Timestamp.fromDate(now),
    });

    return {
      id: existingDoc.id,
      ...rating,
      createdAt: existingDoc.data().createdAt.toDate(),
      updatedAt: now,
    };
  } else {
    // Create new rating
    const docRef = await addDoc(collection(db, 'ratings'), {
      ...rating,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    return {
      id: docRef.id,
      ...rating,
      createdAt: now,
      updatedAt: now,
    };
  }
}

export async function deleteRating(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ratings', id));
}