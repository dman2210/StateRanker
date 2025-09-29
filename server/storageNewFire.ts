import { type User, type InsertUser, type Criterion, type InsertCriterion, type State, type InsertState, type Rating, type InsertRating } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "@shared/firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  getCriterion(id: string): Promise<Criterion | undefined>;
  getAllCriteria(): Promise<Criterion[]>;
  createCriterion(criterion: InsertCriterion): Promise<Criterion>;
  updateCriterion(id: string, updates: Partial<InsertCriterion>): Promise<Criterion | undefined>;
  deleteCriterion(id: string): Promise<boolean>;

  getState(code: string): Promise<State | undefined>;
  getAllStates(): Promise<State[]>;
  createState(state: InsertState): Promise<State>;

  getRating(userId: string, stateCode: string, criterionId: string): Promise<Rating | undefined>;
  getRatingsByUser(userId: string): Promise<Rating[]>;
  getRatingsByState(stateCode: string): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | undefined>;
  deleteRating(id: string): Promise<boolean>;
}

export class FirestoreStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Remove the hardcoded user initialization since users will be created via auth
    // Keep criteria and states initialization
    
    // Check if criteria already exist
    const criteriaSnapshot = await getDocs(collection(db, 'criteria'));
    if (criteriaSnapshot.empty) {
      // Initialize default criteria
      const defaultCriteria = [
        { name: "Cost of Living", weight: 1.0, color: "#1976D2", isActive: true },
        { name: "Climate", weight: 1.5, color: "#DC004E", isActive: true },
        { name: "Job Market", weight: 2.0, color: "#388E3C", isActive: true },
        { name: "Culture & Entertainment", weight: 1.0, color: "#F57C00", isActive: true },
      ];

      for (const criterion of defaultCriteria) {
        await this.createCriterion(criterion);
      }
    }

    // Initialize US states
    const usStates = [
      { code: "AL", name: "Alabama", abbreviation: "AL" },
      { code: "AK", name: "Alaska", abbreviation: "AK" },
      { code: "AZ", name: "Arizona", abbreviation: "AZ" },
      { code: "AR", name: "Arkansas", abbreviation: "AR" },
      { code: "CA", name: "California", abbreviation: "CA" },
      { code: "CO", name: "Colorado", abbreviation: "CO" },
      { code: "CT", name: "Connecticut", abbreviation: "CT" },
      { code: "DE", name: "Delaware", abbreviation: "DE" },
      { code: "FL", name: "Florida", abbreviation: "FL" },
      { code: "GA", name: "Georgia", abbreviation: "GA" },
      { code: "HI", name: "Hawaii", abbreviation: "HI" },
      { code: "ID", name: "Idaho", abbreviation: "ID" },
      { code: "IL", name: "Illinois", abbreviation: "IL" },
      { code: "IN", name: "Indiana", abbreviation: "IN" },
      { code: "IA", name: "Iowa", abbreviation: "IA" },
      { code: "KS", name: "Kansas", abbreviation: "KS" },
      { code: "KY", name: "Kentucky", abbreviation: "KY" },
      { code: "LA", name: "Louisiana", abbreviation: "LA" },
      { code: "ME", name: "Maine", abbreviation: "ME" },
      { code: "MD", name: "Maryland", abbreviation: "MD" },
      { code: "MA", name: "Massachusetts", abbreviation: "MA" },
      { code: "MI", name: "Michigan", abbreviation: "MI" },
      { code: "MN", name: "Minnesota", abbreviation: "MN" },
      { code: "MS", name: "Mississippi", abbreviation: "MS" },
      { code: "MO", name: "Missouri", abbreviation: "MO" },
      { code: "MT", name: "Montana", abbreviation: "MT" },
      { code: "NE", name: "Nebraska", abbreviation: "NE" },
      { code: "NV", name: "Nevada", abbreviation: "NV" },
      { code: "NH", name: "New Hampshire", abbreviation: "NH" },
      { code: "NJ", name: "New Jersey", abbreviation: "NJ" },
      { code: "NM", name: "New Mexico", abbreviation: "NM" },
      { code: "NY", name: "New York", abbreviation: "NY" },
      { code: "NC", name: "North Carolina", abbreviation: "NC" },
      { code: "ND", name: "North Dakota", abbreviation: "ND" },
      { code: "OH", name: "Ohio", abbreviation: "OH" },
      { code: "OK", name: "Oklahoma", abbreviation: "OK" },
      { code: "OR", name: "Oregon", abbreviation: "OR" },
      { code: "PA", name: "Pennsylvania", abbreviation: "PA" },
      { code: "RI", name: "Rhode Island", abbreviation: "RI" },
      { code: "SC", name: "South Carolina", abbreviation: "SC" },
      { code: "SD", name: "South Dakota", abbreviation: "SD" },
      { code: "TN", name: "Tennessee", abbreviation: "TN" },
      { code: "TX", name: "Texas", abbreviation: "TX" },
      { code: "UT", name: "Utah", abbreviation: "UT" },
      { code: "VT", name: "Vermont", abbreviation: "VT" },
      { code: "VA", name: "Virginia", abbreviation: "VA" },
      { code: "WA", name: "Washington", abbreviation: "WA" },
      { code: "WV", name: "West Virginia", abbreviation: "WV" },
      { code: "WI", name: "Wisconsin", abbreviation: "WI" },
      { code: "WY", name: "Wyoming", abbreviation: "WY" },
    ];

    for (const state of usStates) {
      await this.createState(state);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const userDoc = await getDoc(doc(db, "users", id));
    return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const docRef = await addDoc(collection(db, "users"), insertUser);
    return { id: docRef.id, ...insertUser };
  }

  async getAllUsers(): Promise<User[]> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getCriterion(id: string): Promise<Criterion | undefined> {
    const criterionDoc = await getDoc(doc(db, "criteria", id));
    return criterionDoc.exists() ? ({ id: criterionDoc.id, ...criterionDoc.data() } as Criterion) : undefined;
  }

  async getAllCriteria(): Promise<Criterion[]> {
    const criteriaSnapshot = await getDocs(collection(db, 'criteria'));
    return criteriaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Criterion));
  }

  async createCriterion(insertCriterion: InsertCriterion): Promise<Criterion> {
    const docRef = await addDoc(collection(db, "criteria"), insertCriterion);
    return { id: docRef.id, ...insertCriterion };
  }

  async updateCriterion(id: string, updates: Partial<InsertCriterion>): Promise<Criterion | undefined> {
    const criterion = await this.getCriterion(id);
    if (!criterion) return undefined;
    
    await updateDoc(doc(db, "criteria", id), updates);
    return { ...criterion, ...updates };
  }

  async deleteCriterion(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "criteria", id));
      return true;
    } catch {
      return false;
    }
  }

  async getState(code: string): Promise<State | undefined> {
    const q = query(collection(db, 'states'), where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as State;
    }
    return undefined;
  }

  async getAllStates(): Promise<State[]> {
    const statesSnapshot = await getDocs(collection(db, 'states'));
    return statesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as State));
  }

  async createState(insertState: InsertState): Promise<State> {
    const docRef = await addDoc(collection(db, "states"), insertState);
    return { id: docRef.id, ...insertState };
  }

  async getRating(userId: string, stateCode: string, criterionId: string): Promise<Rating | undefined> {
    const q = query(collection(db, 'ratings'), 
      where('userId', '==', userId), 
      where('stateCode', '==', stateCode), 
      where('criterionId', '==', criterionId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Rating;
    }
    return undefined;
  }

  async getRatingsByUser(userId: string): Promise<Rating[]> {
    const q = query(collection(db, 'ratings'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating));
  }

  async getRatingsByState(stateCode: string): Promise<Rating[]> {
    const q = query(collection(db, 'ratings'), where('stateCode', '==', stateCode));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating));
  }

  async getAllRatings(): Promise<Rating[]> {
    const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
    return ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating));
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const docRef = await addDoc(collection(db, "ratings"), insertRating);
    return { id: docRef.id, ...insertRating };
  }

  async updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | undefined> {
    const rating = await this.getRating(id);
    if (!rating) return undefined;
    
    await updateDoc(doc(db, "ratings", id), updates);
    return { ...rating, ...updates };
  }

  async deleteRating(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "ratings", id));
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new FirestoreStorage();
