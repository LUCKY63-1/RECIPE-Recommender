import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// This service sets up a new SQLite database connection and exports it for use in other services.
// It includes a function to initialize the database and create the 'favorites' table if it doesn't exist.

let db: Database;

/**
 * Initializes the SQLite database.
 * This function creates a new database file if one doesn't exist and sets up the necessary tables.
 * @returns A promise that resolves when the database is successfully initialized.
 */
export async function initDb(): Promise<void> {
  try {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Create the 'favorites' table if it doesn't exist.
    // The 'recipe' column will store the full recipe object as a JSON string.
    await db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        recipe TEXT NOT NULL
      )
    `);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Exit if the database fails to initialize
  }
}

/**
 * Returns the database instance.
 * Throws an error if the database has not been initialized.
 * @returns The SQLite database instance.
 */
export function getDb(): Database {
  if (!db) {
    throw new Error('Database has not been initialized. Please call initDb first.');
  }
  return db;
}
