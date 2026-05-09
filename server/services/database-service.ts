import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { Database } from '../models';

export class DatabaseService {
  private dbPath: string;
  private dataDir: string;
  private dbLock: Promise<void> = Promise.resolve();

  constructor() {
    this.dataDir = resolve(process.cwd(), 'data');
    this.dbPath = join(this.dataDir, 'db.json');
  }

  async initialize(): Promise<void> {
    await this.ensureDataDirExists();
    await this.ensureDbExists();
  }

  private async ensureDataDirExists(): Promise<void> {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  private async ensureDbExists(): Promise<void> {
    if (!existsSync(this.dbPath)) {
      const initialData: Database = {
        photos: [],
        albums: [],
        photosOnAlbums: []
      };
      await this.writeDatabase(initialData);
    }
  }

  async readDatabase(): Promise<Database> {
    try {
      const data = await readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);

      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }

      const emptyDb: Database = {
        photos: [],
        albums: [],
        photosOnAlbums: []
      };
      await this.writeDatabase(emptyDb);
      return emptyDb;
    }
  }

  async writeDatabase(data: Database): Promise<void> {
    try {
      const tempPath = join(this.dataDir, `db.json.${randomUUID()}.tmp`);
      await writeFile(tempPath, JSON.stringify(data, null, 2));
      await rename(tempPath, this.dbPath);
    } catch (error) {
      console.error('Error writing database:', error);
      throw new Error('Failed to write to database');
    }
  }

  async updateDatabase<T>(updater: (db: Database) => Promise<T> | T): Promise<T> {
    const previousOperation = this.dbLock;
    let release!: () => void;

    this.dbLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previousOperation;

    try {
      const db = await this.readDatabase();
      const result = await updater(db);
      await this.writeDatabase(db);
      return result;
    } finally {
      release();
    }
  }
} 