import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const scoresTable = pgTable('scores', {
  owner: text().notNull(),
  timestamp: timestamp({ mode: 'date' }).notNull().defaultNow(),
  score: integer().notNull(),
});
