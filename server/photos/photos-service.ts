import {randomUUID} from "crypto";
import {DatabaseService} from "../services/database-service.ts";
import {ImageService} from "../services/image-service.ts";
import {Album, Photo} from "../models.ts";
import {
	CreatePhotoRequest,
	UpdatePhotoRequest,
	managePhotoOnAlbumsRequest,
} from "./photos-interfaces.ts";

export class PhotosService {
	private dbService: DatabaseService;
	private imageService: ImageService;

	constructor(dbService: DatabaseService, imageService: ImageService) {
		this.dbService = dbService;
		this.imageService = imageService;
	}

	private async populatePhotoAlbums(
		photo: Photo,
		photosOnAlbums: Array<{photoId: string; albumId: string}>
	): Promise<Photo & {albums: Album[]}> {
		const db = await this.dbService.readDatabase();
		const albumPromises = photosOnAlbums
			.filter((relation) => relation.photoId === photo.id)
			.map((relation) =>
				db.albums.find((album) => album.id === relation.albumId)
			);

		const albums = await Promise.all(albumPromises);

		return {
			...photo,
			albums:
				albums.filter((album): album is Album => album !== undefined) || [],
		};
	}

	async getAllPhotos(albumId?: string, q?: string): Promise<Photo[]> {
		const db = await this.dbService.readDatabase();

		let photos: Photo[] = db.photos;

		if (q) {
			photos = photos.filter((photo) =>
				photo.title.toLowerCase().includes(q.toLowerCase())
			);
		}

		if (albumId) {
			const photoIds = db.photosOnAlbums
				.filter((relation) => relation.albumId === albumId)
				.map((relation) => relation.photoId);

			photos = photos.filter((photo) => photoIds.includes(photo.id));
		}

		// Populate albumIds for each photo
		const populatedPhotos = await Promise.all(
			photos.map((photo) => this.populatePhotoAlbums(photo, db.photosOnAlbums))
		);

		return populatedPhotos;
	}

	async getPhotoById(
		id: string
	): Promise<
		| (Photo & {nextPhotoId: string | null; previousPhotoId: string | null})
		| null
	> {
		const db = await this.dbService.readDatabase();
		const photo = db.photos.find((photo) => photo.id === id);

		if (!photo) {
			return null;
		}

		const photos = await this.getAllPhotos();

		const nextPhoto =
			photos.findIndex((p) => p.id === photo.id) + 1 < photos.length
				? photos[photos.findIndex((p) => p.id === photo.id) + 1].id
				: null;
		const previousPhoto =
			photos.findIndex((p) => p.id === photo.id) - 1 >= 0
				? photos[photos.findIndex((p) => p.id === photo.id) - 1].id
				: null;

		return {
			...(await this.populatePhotoAlbums(photo, db.photosOnAlbums)),
			nextPhotoId: nextPhoto,
			previousPhotoId: previousPhoto,
		};
	}

	async createPhoto(photoData: CreatePhotoRequest): Promise<Photo> {
		const photoId = randomUUID();

		const photo: Photo = {
			id: photoId,
			title: photoData.title,
			albumsIds: photoData.albumsIds || [],
			// imageId will be added when image is uploaded
		};

		await this.dbService.updateDatabase((db) => {
			db.photos.push(photo);
		});

		return photo;
	}

	async uploadImage(
		photoId: string,
		imageBuffer: Buffer,
		filename: string
	): Promise<Photo | null> {
		let updatedPhoto: Photo | null = null;

		await this.dbService.updateDatabase(async (db) => {
			const photoIndex = db.photos.findIndex((photo) => photo.id === photoId);

			if (photoIndex === -1) {
				updatedPhoto = null;
				return;
			}

			if (db.photos[photoIndex].imageId) {
				await this.imageService.deleteImage(db.photos[photoIndex].imageId);
			}

			const imageId = await this.imageService.uploadImage(imageBuffer, filename);
			db.photos[photoIndex].imageId = imageId;
			updatedPhoto = db.photos[photoIndex];
		});

		if (!updatedPhoto) {
			return null;
		}

		return await this.populatePhotoAlbums(updatedPhoto, (await this.dbService.readDatabase()).photosOnAlbums);
	}

	async updatePhoto(
		id: string,
		updateData: UpdatePhotoRequest
	): Promise<Photo | null> {
		let updatedPhoto: Photo | null = null;

		await this.dbService.updateDatabase((db) => {
			const photoIndex = db.photos.findIndex((photo) => photo.id === id);

			if (photoIndex === -1) {
				updatedPhoto = null;
				return;
			}

			db.photos[photoIndex].title = updateData.title;
			updatedPhoto = db.photos[photoIndex];
		});

		if (!updatedPhoto) {
			return null;
		}

		return await this.populatePhotoAlbums(
			updatedPhoto,
			(await this.dbService.readDatabase()).photosOnAlbums
		);
	}

	async deletePhoto(id: string): Promise<boolean> {
		let imageIdToDelete: string | undefined;

		const deleted = await this.dbService.updateDatabase(async (db) => {
			const photoIndex = db.photos.findIndex((photo) => photo.id === id);

			if (photoIndex === -1) {
				return false;
			}

			imageIdToDelete = db.photos[photoIndex].imageId;
			db.photos.splice(photoIndex, 1);
			db.photosOnAlbums = db.photosOnAlbums.filter(
				(relation) => relation.photoId !== id
			);

			return true;
		});

		if (deleted && imageIdToDelete) {
			await this.imageService.deleteImage(imageIdToDelete);
		}

		return deleted;
	}

	async addPhotoToAlbum(photoId: string, albumId: string): Promise<boolean> {
		return await this.dbService.updateDatabase((db) => {
			const photoExists = db.photos.some((photo) => photo.id === photoId);
			const albumExists = db.albums.some((album) => album.id === albumId);

			if (!photoExists || !albumExists) {
				return false;
			}

			const relationExists = db.photosOnAlbums.some(
				(relation) =>
					relation.photoId === photoId && relation.albumId === albumId
			);

			if (relationExists) {
				return true;
			}

			db.photosOnAlbums.push({
				photoId: photoId,
				albumId: albumId,
			});

			return true;
		});
	}

	async managePhotoOnAlbums(
		photoId: string,
		albumsData: managePhotoOnAlbumsRequest
	): Promise<boolean> {
		return await this.dbService.updateDatabase((db) => {
			const photoExists = db.photos.some((photo) => photo.id === photoId);
			if (!photoExists) {
				return false;
			}

			const {albumsIds} = albumsData;
			for (const albumId of albumsIds) {
				const albumExists = db.albums.some((album) => album.id === albumId);
				if (!albumExists) {
					return false;
				}
			}

			const currentAlbumsIds = new Set(
				db.photosOnAlbums
					.filter((relation) => relation.photoId === photoId)
					.map((relation) => relation.albumId)
			);

			for (const albumId of albumsIds) {
				if (currentAlbumsIds.has(albumId)) {
					continue;
				}

				db.photosOnAlbums.push({
					photoId: photoId,
					albumId: albumId,
				});
			}

			return true;
		});
	}
}
