import { toast } from "sonner";
import type { AlbumNewFormSchema } from "../schemas";
import { api } from "../../../helpers/api";
import type { Album } from "../models/album";
import { useQueryClient } from "@tanstack/react-query";

export default function useAlbum() {
    const queryClient = useQueryClient();

    async function createAlbum({title, photosIds}: AlbumNewFormSchema) {
        try {
            const {data: album} = await api.post<Album>("/albums", {
                title
            });
            
            if (photosIds && photosIds.length > 0) {
                await Promise.all(photosIds.map(photoId => {
                    return api.put(`/photos/${photoId}/albums`, {
                        albumsIds: [album.id]
                    });
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