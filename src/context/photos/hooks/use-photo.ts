import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api, fetcher } from "../../../helpers/api";
import type { Photo } from "../models/photo";
import type { PhotoNewFormSchema } from "../schemas";

interface PhotoDetailResponse extends Photo {
    nextPhotoId?: string;
    previousPhotoId?: string;
}

export default function usePhoto(id?: string) {
    const {data, isLoading} = useQuery<PhotoDetailResponse>({
        queryKey: ["photo", id],
        queryFn: () => fetcher(`/photos/${id}`),
        enabled: !!id
    });
    const queryClient = useQueryClient();

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
                await api.put(`/photos/${photo.id}/albums`, {
                    albumsIds
                });
            }

            queryClient.invalidateQueries({queryKey: ["photos"]});
        } catch (error) {
            throw error;
        }
    }
    
    return {
        photo: data,
        nextPhotoId: data?.nextPhotoId,
        previousPhotoId: data?.previousPhotoId,
        isLoadingPhoto: isLoading,
        createPhoto
    }
}