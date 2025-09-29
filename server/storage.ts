import { type User, type InsertUser, type Criterion, type InsertCriterion, type State, type InsertState, type Rating, type InsertRating } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  getCriterion(id: string): Promise<Criterion | undefined>;
  getAllCriteria(): Promise<Criterion[]>;
  getCriteriaByUser(userId: string): Promise<Criterion[]>;
  createCriterion(criterion: InsertCriterion): Promise<Criterion>;
  updateCriterion(id: string, updates: Partial<InsertCriterion>): Promise<Criterion | undefined>;
  deleteCriterion(id: string): Promise<boolean>;

  getState(code: string): Promise<State | undefined>;
  getAllStates(): Promise<State[]>;
  createState(state: InsertState): Promise<State>;

  getRating(userId: string, stateCode: string, criterionId: string): Promise<Rating | undefined>;
  getRatingById(id: string): Promise<Rating | undefined>;
  getRatingsByUser(userId: string): Promise<Rating[]>;
  getRatingsByState(stateCode: string): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | undefined>;
  deleteRating(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private criteria: Map<string, Criterion>;
  private states: Map<string, State>;
  private ratings: Map<string, Rating>;

  constructor() {
    this.users = new Map();
    this.criteria = new Map();
    this.states = new Map();
    this.ratings = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default users
    const user1: User = { id: randomUUID(), username: "user", name: "You" };
    const user2: User = { id: randomUUID(), username: "wife", name: "Wife" };
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // Initialize default criteria for the default user
    const defaultCriteria = [
      { name: "Cost of Living", weight: 1.0, color: "#1976D2", isActive: true, userId: user1.id },
      { name: "Climate", weight: 1.5, color: "#DC004E", isActive: true, userId: user1.id },
      { name: "Job Market", weight: 2.0, color: "#388E3C", isActive: true, userId: user1.id },
      { name: "Culture & Entertainment", weight: 1.0, color: "#F57C00", isActive: true, userId: user1.id },
    ];

    defaultCriteria.forEach(criterion => {
      const id = randomUUID();
      this.criteria.set(id, { id, ...criterion });
    });

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

    usStates.forEach(state => {
      const id = randomUUID();
      this.states.set(id, { id, ...state });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getCriterion(id: string): Promise<Criterion | undefined> {
    return this.criteria.get(id);
  }

  async getAllCriteria(): Promise<Criterion[]> {
    return Array.from(this.criteria.values()).filter(c => c.isActive);
  }

  async getCriteriaByUser(userId: string): Promise<Criterion[]> {
    return Array.from(this.criteria.values()).filter(c => c.isActive && c.userId === userId);
  }

  async createCriterion(insertCriterion: InsertCriterion): Promise<Criterion> {
    const id = randomUUID();
    const criterion: Criterion = { 
      ...insertCriterion, 
      id,
      weight: insertCriterion.weight ?? 1.0,
      isActive: insertCriterion.isActive ?? true,
    };
    this.criteria.set(id, criterion);
    return criterion;
  }

  async updateCriterion(id: string, updates: Partial<InsertCriterion>): Promise<Criterion | undefined> {
    const criterion = this.criteria.get(id);
    if (!criterion) return undefined;
    
    const updated = { ...criterion, ...updates };
    this.criteria.set(id, updated);
    return updated;
  }

  async deleteCriterion(id: string): Promise<boolean> {
    return this.criteria.delete(id);
  }

  async getState(code: string): Promise<State | undefined> {
    return Array.from(this.states.values()).find(state => state.code === code);
  }

  async getAllStates(): Promise<State[]> {
    return Array.from(this.states.values());
  }

  async createState(insertState: InsertState): Promise<State> {
    const id = randomUUID();
    const state: State = { ...insertState, id };
    this.states.set(id, state);
    return state;
  }

  async getRating(userId: string, stateCode: string, criterionId: string): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      rating => rating.userId === userId && rating.stateCode === stateCode && rating.criterionId === criterionId
    );
  }

  async getRatingById(id: string): Promise<Rating | undefined> {
    return this.ratings.get(id);
  }

  async getRatingsByUser(userId: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(rating => rating.userId === userId);
  }

  async getRatingsByState(stateCode: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(rating => rating.stateCode === stateCode);
  }

  async getAllRatings(): Promise<Rating[]> {
    return Array.from(this.ratings.values());
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = randomUUID();
    const rating: Rating = { 
      ...insertRating, 
      id,
      notes: insertRating.notes ?? null,
    };
    this.ratings.set(id, rating);
    return rating;
  }

  async updateRating(id: string, updates: Partial<InsertRating>): Promise<Rating | undefined> {
    const rating = this.ratings.get(id);
    if (!rating) return undefined;
    
    const updated = { ...rating, ...updates };
    this.ratings.set(id, updated);
    return updated;
  }

  async deleteRating(id: string): Promise<boolean> {
    return this.ratings.delete(id);
  }
}

export const storage = new MemStorage();
