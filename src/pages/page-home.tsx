import Container from "../components/container";
import AlbumsFilter from "../context/albums/components/albums-filter";
import PhotosList from "../context/photos/components/photos-list";

export default function PageHome() {
    return (
        <Container>
            <AlbumsFilter albums={[
                {id: "12093", title: "Album 1"}
            ]} className="mb-9" />
            <PhotosList
                photos={[
                    {
                        id: "123",
                        title: "olaMundi",
                        imageId: "portrait-tower.png",
                        albums: [{
                            id: "12093",
                            title: "Album 1"
                        }]
                    }
                ]}
            />
        </Container>
    )
}