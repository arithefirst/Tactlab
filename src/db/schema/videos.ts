import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const videosTable = pgTable('videoData', {
  objectId: text().primaryKey().unique(),
  ogFilename: text().notNull(),
  owner: text().notNull(),
  createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
  tlVideoId: text(),
  thumbnail: text(),
});
