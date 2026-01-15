const { useState, useEffect, useRef, useLayoutEffect } = React;

const ACCESS_KEY = "TJGo0aYmhJp9gX9-KchmSG0P0J-6UTpiNSWl_G89bOc";

const App = () => {
    const [query, setQuery] = useState("");
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const gridRef = useRef(null);
    const headerRef = useRef(null);

    // Initial entrance animation
    useLayoutEffect(() => {
        gsap.from(headerRef.current, {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    }, []);

    const searchImages = async (newSearch = false) => {
        if (!query) return;
        setLoading(true);
        const currentPage = newSearch ? 1 : page;
        const url = `https://api.unsplash.com/search/photos?page=${currentPage}&query=${query}&client_id=${ACCESS_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const results = data.results;

            if (newSearch) {
                setImages(results);
                setPage(2);
            } else {
                setImages(prev => [...prev, ...results]);
                setPage(prev => prev + 1);
            }

            // Animate new results
            setTimeout(() => {
                const newItems = gridRef.current.querySelectorAll('.search-result:nth-last-child(-n+' + results.length + ')');
                gsap.fromTo(newItems, 
                    { opacity: 0, y: 30, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
                );
            }, 100);

        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchImages(true);
    };

    const handleClear = () => {
        setQuery("");
        setImages([]);
        setPage(1);
    };

    const hideImage = (id) => {
        const element = document.getElementById(id);
        gsap.to(element, {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                setImages(prev => prev.filter(img => img.id !== id));
            }
        });
    };

    return (
        <div className="container">
            <header ref={headerRef}>
                <h1 className="title">✨ Picture Hunt</h1>
                <form onSubmit={handleSearch} className="search-form">
                    <div className="input-wrapper">
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="Explore the magic..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="buttons">
                            <button type="submit" id="search-button">Search</button>
                            <button type="button" id="clear-button" onClick={handleClear}>Clear</button>
                        </div>
                    </div>
                </form>
            </header>

            <main className="search-results" ref={gridRef}>
                {images.map((img) => (
                    <ImageCard 
                        key={img.id + Math.random()} 
                        img={img} 
                        onHide={() => hideImage(img.id)} 
                    />
                ))}
            </main>

            {images.length > 0 && (
                <button 
                    id="show-more-button" 
                    onClick={() => searchImages()}
                    disabled={loading}
                    style={{ display: 'block' }}
                >
                    {loading ? "Loading..." : "Show More"}
                </button>
            )}
        </div>
    );
};

const ImageCard = ({ img, onHide }) => {
    const cardRef = useRef(null);

    const downloadImage = async () => {
        try {
            const response = await fetch(img.urls.full);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${img.alt_description || 'image'}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div className="search-result" id={img.id} ref={cardRef}>
            <div className="image-container">
                <img src={img.urls.small} alt={img.alt_description} />
                <div className="overlay">
                    <button className="download-button" onClick={downloadImage}>Download</button>
                    <button className="hide-button" onClick={onHide}>Hide</button>
                </div>
            </div>
            <a href={img.links.html} target="_blank" className="img-title">
                {img.alt_description || "Untitled Artwork"}
            </a>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
