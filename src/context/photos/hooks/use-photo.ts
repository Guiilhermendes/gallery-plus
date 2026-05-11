import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api, fetcher } from "../../../helpers/api";
import type { Photo } from "../models/photo";
import type { PhotoNewFormSchema } from "../schemas";
import { toast } from "sonner";
import usePhotoAlbums from "./use-photo-albums";
import { useNavigate } from "react-router";

interface PhotoDetailResponse extends Photo {
    nextPhotoId?: string;
    previousPhotoId?: string;
}

export default function usePhoto(id?: string) {
    const navigate = useNavigate();
    const {data, isLoading} = useQuery<PhotoDetailResponse>({
        queryKey: ["photo", id],
        queryFn: () => fetcher(`/photos/${id}`),
        enabled: !!id
    });
    const queryClient = useQueryClient();
    const { managePhotoOnAlbum } = usePhotoAlbums();

    async function createPhoto({title, file, albumsIds}: PhotoNewFormSchema) {
        try {
            const {data: photo} = await api.post<Photo>("/photos", {
                title
            });

            await api.post(`/photos/${photo.id}/image`, {
                file: file[0]
            }, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (albumsIds && albumsIds.length > 0) {
                await managePhotoOnAlbum(photo.id, albumsIds)
            }

            queryClient.invalidateQueries({queryKey: ["photos"]});
            toast.success("Photo created successfully")
        } catch (error) {
            toast.error("Error creating photo")
            throw error;
        }
    }

    async function deletePhoto(photoId: string) {
        try {
            await api.delete(`photos/${photoId}`);
            
            toast.success("Photo deleted successfully");
            navigate("/");
        } catch (error) {
        toast.error("error deleting photo");
            throw error;
        }
    }
    
    return {
        photo: data,
        nextPhotoId: data?.nextPhotoId,
        previousPhotoId: data?.previousPhotoId,
        isLoadingPhoto: isLoading,
        createPhoto,
        deletePhoto
    }
}