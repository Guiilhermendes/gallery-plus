import { randomUUID } from 'crypto';
import { DatabaseService } from '../services/database-service';
import { Album } from '../models';
import { CreateAlbumRequest } from './albums-interfaces';

export class AlbumsService {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  async getAllAlbums(): Promise<Album[]> {
    const db = await this.dbService.readDatabase();
    return db.albums;
  }

  async getAlbumById(id: string): Promise<Album | null> {
    const db = await this.dbService.readDatabase();
    return db.albums.find(album => album.id === id) || null;
  }

  async createAlbum(albumData: CreateAlbumRequest): Promise<Album> {
    const albumId = randomUUID();
    
    const album: Album = {
      id: albumId,
      title: albumData.title
    };

    await this.dbService.updateDatabase((db) => {
      db.albums.push(album);
    });

    return album;
  }

  async deleteAlbum(id: string): Promise<boolean> {
    return await this.dbService.updateDatabase((db) => {
      const albumIndex = db.albums.findIndex((album) => album.id === id);

      if (albumIndex === -1) {
        return false;
      }

      db.albums.splice(albumIndex, 1);
      db.photosOnAlbums = db.photosOnAlbums.filter(
        (relation) => relation.albumId !== id
      );

      return true;
    });
  }
} 