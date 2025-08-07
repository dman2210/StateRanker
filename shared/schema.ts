import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
});

export const criteria = pgTable("criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  weight: real("weight").notNull().default(1.0),
  color: text("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const states = pgTable("states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
});

export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  stateCode: text("state_code").notNull(),
  criterionId: text("criterion_id").notNull(),
  rating: integer("rating").notNull(), // 1-10 scale
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
});

export const insertCriterionSchema = createInsertSchema(criteria).pick({
  name: true,
  weight: true,
  color: true,
  isActive: true,
});

export const insertStateSchema = createInsertSchema(states).pick({
  code: true,
  name: true,
  abbreviation: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  userId: true,
  stateCode: true,
  criterionId: true,
  rating: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCriterion = z.infer<typeof insertCriterionSchema>;
export type Criterion = typeof criteria.$inferSelect;

export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof states.$inferSelect;

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;
