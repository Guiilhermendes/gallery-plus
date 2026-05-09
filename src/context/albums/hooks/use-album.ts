import { toast } from "sonner";
import type { AlbumNewFormSchema } from "../schemas";
import { api } from "../../../helpers/api";
import type { Album } from "../models/album";
import { useQueryClient } from "@tanstack/react-query";
import usePhotoAlbums from "../../photos/hooks/use-photo-albums";

export default function useAlbum() {
    const queryClient = useQueryClient();
    const { managePhotoOnAlbum } = usePhotoAlbums();

    async function createAlbum({title, photosIds}: AlbumNewFormSchema) {
        try {
            const {data: album} = await api.post<Album>("/albums", {
                title
            });
            
            if (photosIds && photosIds.length > 0) {
                await Promise.all(photosIds.map(photoId => {
                    return managePhotoOnAlbum(photoId, [album.id]);
                }));
            }

            queryClient.invalidateQueries({queryKey: ["albums"]});
            queryClient.invalidateQueries({queryKey: ["photos"]});
            toast.success("Album created successfully");
        } catch (error) {
            toast.error("Error creating album");
            throw error;
        }
    }

    return {
        createAlbum
    }
}