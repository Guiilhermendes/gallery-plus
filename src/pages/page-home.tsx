import Container from "../components/container";
import AlbumsFilter from "../context/albums/components/albums-filter";
import PhotosList from "../context/photos/components/photos-list";

export default function PageHome() {
    return (
        <Container>
            <AlbumsFilter className="mb-9" />
            <PhotosList />
        </Container>
    )
}