import Container from "../components/container";
import PhotoWidget from "../context/photos/components/photo-widget";
import type { Photo } from "../context/photos/models/photo";

export default function PageHome() {
    return (
        <Container>
            <div className="grid grid-cols-4 gap-9">
                <PhotoWidget
                    photo={{
                        id: "123",
                        title: "olaMundi",
                        imageId: "portrait-tower.png",
                        albums: [{
                            id: "321",
                            title: "album1"
                        }]
                    }}
                />
                <PhotoWidget
                    photo={{} as Photo}
                    loading
                />
            </div>
        </Container>
    )
}