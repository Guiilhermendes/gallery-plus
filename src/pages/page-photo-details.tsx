import { useParams } from "react-router";
import Container from "../components/container";
import Text from "../components/text";
import type { Photo } from "../context/photos/models/photo";
import Skeleton from "../components/skeleton";
import PhotosNavigator from "../context/photos/components/photos-navigator";
import ImagePreview from "../components/image-preview";
import Button from "../components/button";
import AlbumsListSelectable from "../context/albums/components/albums-list-selectable";

export default function PagePhotoDetails() {
    const { id } = useParams();
    const isLoadingPhoto = false;
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
                    <Text as="h2" variant="heading-large">{photo.title}</Text>
                ) : (
                    <Skeleton className="w-48 h-8" />
                )}

                <PhotosNavigator loading={isLoadingPhoto} />
            </header>

            <div className="grid grid-cols-[21rem_1fr] gap-24">
                <div className="space-y-3">
                    {!isLoadingPhoto ? (
                        <ImagePreview
                            src={`/images/${photo?.imageId}`}
                            title={photo.title}
                            imageClassName="h-[21rem]"
                        />
                    ) : (
                        <Skeleton className="h-[21rem]" />
                    )}

                    {!isLoadingPhoto ? (
                        <Button
                            variant="destructive"
                        >
                            Excluir
                        </Button>
                    ) : (
                        <Skeleton className="w-20 h-10" />
                    )}
                </div>

                <div className="py-3">
                    <Text as="h3" variant="heading-medium" className="mb-6">
                        Álbuns
                    </Text>
                    <AlbumsListSelectable
                        photo={photo}
                        albums={[
                            {id: "1", title: "123"},
                            {id: "12", title: "123"},
                            {id: "13", title: "123"},
                        ]}
                        loading={!isLoadingPhoto}
                    />
                </div>
            </div>
        </Container>
    )
}