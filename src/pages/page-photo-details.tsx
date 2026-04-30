import { useParams } from "react-router";
import Container from "../components/container";
import Text from "../components/text";
import type { Photo } from "../context/photos/models/photo";
import Skeleton from "../components/skeleton";
import PhotosNavigator from "../context/photos/components/photos-navigator";

export default function PagePhotoDetails() {
    const { id } = useParams();
    const isLoadingPhoto = true;
    const photo =
        {
            id: "123",
            title: "olaMundi",
            imageId: "portrait-tower.png",
            albums: [{
                id: "321",
                title: "album1"
            }]
        } as Photo;

    return (
        <Container>
            <header className="flex items-center justify-between gap-8 mb-8">
                {!isLoadingPhoto ? (
                    <Text variant="heading-large">{photo.title}</Text>
                ) : (
                    <Skeleton className="w-48 h-8" />
                )}

                <PhotosNavigator loading={isLoadingPhoto} />
            </header>
        </Container>
    )
}