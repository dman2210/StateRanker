import { db } from './firebase';
import { 
  User, 
  Criterion, 
  State, 
  Rating,
  InsertUser,
  InsertCriterion,
  InsertRating
} from "@shared/schema";

export class FirestoreStorage {
  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const userRef = await db.collection('users').add({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: userRef.id,
      ...user,
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as User;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const snapshot = await db.collection('users').where('username', '==', username).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as User;
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  }

  // Criteria operations
  async createCriterion(criterion: InsertCriterion): Promise<Criterion> {
    const criterionRef = await db.collection('criteria').add({
      ...criterion,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: criterionRef.id,
      ...criterion,
      weight: criterion.weight ?? 1.0,
      isActive: criterion.isActive ?? true,
    };
  }

  async getCriterionById(id: string): Promise<Criterion | null> {
    const doc = await db.collection('criteria').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as Criterion;
  }

  async getAllCriteria(): Promise<Criterion[]> {
    const snapshot = await db.collection('criteria').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Criterion[];
  }

  async getCriteriaByUser(userId: string): Promise<Criterion[]> {
    const snapshot = await db.collection('criteria').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Criterion[];
  }

  async updateCriterion(id: string, updates: Partial<InsertCriterion>): Promise<Criterion | null> {
    const criterionRef = db.collection('criteria').doc(id);
    const doc = await criterionRef.get();
    
    if (!doc.exists) {
      return null;
    }

    await criterionRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    const updatedDoc = await criterionRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Criterion;
  }

  async deleteCriterion(id: string): Promise<boolean> {
    const criterionRef = db.collection('criteria').doc(id);
    const doc = await criterionRef.get();
    
    if (!doc.exists) {
      return false;
    }

    await criterionRef.delete();
    return true;
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const ratingRef = await db.collection('ratings').add({
      ...rating,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: ratingRef.id,
      ...rating,
      notes: rating.notes ?? null,
    };
  }

  async getRatingById(id: string): Promise<Rating | null> {
    const doc = await db.collection('ratings').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as Rating;
  }

  async getRating(userId: string, stateCode: string, criterionId: string): Promise<Rating | null> {
    const snapshot = await db.collection('ratings')
      .where('userId', '==', userId)
      .where('stateCode', '==', stateCode)
      .where('criterionId', '==', criterionId)
      .get();
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Rating;
  }

  async getAllRatings(): Promise<Rating[]> {
    const snapshot = await db.collection('ratings').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Rating[];
  }

  async getRatingsByUser(userId: string): Promise<Rating[]> {
    const snapshot = await db.collection('ratings').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Rating[];
  }

  async getRatingsByState(stateCode: string): Promise<Rating[]> {
    const snapshot = await db.collection('ratings').where('stateCode', '==', stateCode).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Rating[];
  }

  async updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | null> {
    const ratingRef = db.collection('ratings').doc(id);
    const doc = await ratingRef.get();
    
    if (!doc.exists) {
      return null;
    }

    await ratingRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    const updatedDoc = await ratingRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Rating;
  }

  async deleteRating(id: string): Promise<boolean> {
    const ratingRef = db.collection('ratings').doc(id);
    const doc = await ratingRef.get();
    
    if (!doc.exists) {
      return false;
    }

    await ratingRef.delete();
    return true;
  }

  // State operations (these can remain static since states don't change per user)
  async getAllStates(): Promise<State[]> {
    // Return hardcoded US states for now
    return [
      { id: '1', code: 'AL', name: 'Alabama', abbreviation: 'AL' },
      { id: '2', code: 'AK', name: 'Alaska', abbreviation: 'AK' },
      { id: '3', code: 'AZ', name: 'Arizona', abbreviation: 'AZ' },
      { id: '4', code: 'AR', name: 'Arkansas', abbreviation: 'AR' },
      { id: '5', code: 'CA', name: 'California', abbreviation: 'CA' },
      { id: '6', code: 'CO', name: 'Colorado', abbreviation: 'CO' },
      { id: '7', code: 'CT', name: 'Connecticut', abbreviation: 'CT' },
      { id: '8', code: 'DE', name: 'Delaware', abbreviation: 'DE' },
      { id: '9', code: 'FL', name: 'Florida', abbreviation: 'FL' },
      { id: '10', code: 'GA', name: 'Georgia', abbreviation: 'GA' },
      { id: '11', code: 'HI', name: 'Hawaii', abbreviation: 'HI' },
      { id: '12', code: 'ID', name: 'Idaho', abbreviation: 'ID' },
      { id: '13', code: 'IL', name: 'Illinois', abbreviation: 'IL' },
      { id: '14', code: 'IN', name: 'Indiana', abbreviation: 'IN' },
      { id: '15', code: 'IA', name: 'Iowa', abbreviation: 'IA' },
      { id: '16', code: 'KS', name: 'Kansas', abbreviation: 'KS' },
      { id: '17', code: 'KY', name: 'Kentucky', abbreviation: 'KY' },
      { id: '18', code: 'LA', name: 'Louisiana', abbreviation: 'LA' },
      { id: '19', code: 'ME', name: 'Maine', abbreviation: 'ME' },
      { id: '20', code: 'MD', name: 'Maryland', abbreviation: 'MD' },
      { id: '21', code: 'MA', name: 'Massachusetts', abbreviation: 'MA' },
      { id: '22', code: 'MI', name: 'Michigan', abbreviation: 'MI' },
      { id: '23', code: 'MN', name: 'Minnesota', abbreviation: 'MN' },
      { id: '24', code: 'MS', name: 'Mississippi', abbreviation: 'MS' },
      { id: '25', code: 'MO', name: 'Missouri', abbreviation: 'MO' },
      { id: '26', code: 'MT', name: 'Montana', abbreviation: 'MT' },
      { id: '27', code: 'NE', name: 'Nebraska', abbreviation: 'NE' },
      { id: '28', code: 'NV', name: 'Nevada', abbreviation: 'NV' },
      { id: '29', code: 'NH', name: 'New Hampshire', abbreviation: 'NH' },
      { id: '30', code: 'NJ', name: 'New Jersey', abbreviation: 'NJ' },
      { id: '31', code: 'NM', name: 'New Mexico', abbreviation: 'NM' },
      { id: '32', code: 'NY', name: 'New York', abbreviation: 'NY' },
      { id: '33', code: 'NC', name: 'North Carolina', abbreviation: 'NC' },
      { id: '34', code: 'ND', name: 'North Dakota', abbreviation: 'ND' },
      { id: '35', code: 'OH', name: 'Ohio', abbreviation: 'OH' },
      { id: '36', code: 'OK', name: 'Oklahoma', abbreviation: 'OK' },
      { id: '37', code: 'OR', name: 'Oregon', abbreviation: 'OR' },
      { id: '38', code: 'PA', name: 'Pennsylvania', abbreviation: 'PA' },
      { id: '39', code: 'RI', name: 'Rhode Island', abbreviation: 'RI' },
      { id: '40', code: 'SC', name: 'South Carolina', abbreviation: 'SC' },
      { id: '41', code: 'SD', name: 'South Dakota', abbreviation: 'SD' },
      { id: '42', code: 'TN', name: 'Tennessee', abbreviation: 'TN' },
      { id: '43', code: 'TX', name: 'Texas', abbreviation: 'TX' },
      { id: '44', code: 'UT', name: 'Utah', abbreviation: 'UT' },
      { id: '45', code: 'VT', name: 'Vermont', abbreviation: 'VT' },
      { id: '46', code: 'VA', name: 'Virginia', abbreviation: 'VA' },
      { id: '47', code: 'WA', name: 'Washington', abbreviation: 'WA' },
      { id: '48', code: 'WV', name: 'West Virginia', abbreviation: 'WV' },
      { id: '49', code: 'WI', name: 'Wisconsin', abbreviation: 'WI' },
      { id: '50', code: 'WY', name: 'Wyoming', abbreviation: 'WY' },
    ];
  }

  async getState(code: string): Promise<State | null> {
    const states = await this.getAllStates();
    return states.find(state => state.code === code) || null;
  }
}