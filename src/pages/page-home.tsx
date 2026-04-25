import Container from "../components/container";
import PhotosList from "../context/photos/components/photos-list";

export default function PageHome() {
    return (
        <Container>
            <PhotosList
                photos={[
                    {
                        id: "123",
                        title: "olaMundi",
                        imageId: "portrait-tower.png",
                        albums: [{
                            id: "321",
                            title: "album1"
                        }]
                    }
                ]}
            />
        </Container>
    )
}