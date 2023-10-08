// Your access key for the Unsplash API
const accessKey = "TJGo0aYmhJp9gX9-KchmSG0P0J-6UTpiNSWl_G89bOc";

// DOM elements
const formE1 = document.querySelector("form");
const inputE1 = document.getElementById("search-input");
const searchResults = document.querySelector(".search-results");
const showMore = document.getElementById("show-more-button");
const clearButton = document.getElementById("clear-button");

// Variables to store user input and current page
let inputData = "";
let page = 1;

// Function to fetch and display search results
async function searchImages() {
    // Get user input
    inputData = inputE1.value;
    // Construct the API URL with the user input and access key
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${inputData}&client_id=${accessKey}`;

    try {
        // Fetch images from the API
        const response = await fetch(url);
        const data = await response.json();

        // Extract image results from the response
        const results = data.results;

        // Clear the search results if it's the first page
        if (page === 1) {
            searchResults.innerHTML = "";
        }

        // Loop through the image results
        results.map(async (result) => {
            // Create a container for each image result
            const imageWrapper = document.createElement("div");
            imageWrapper.classList.add("search-result");

            // Create an image element
            const image = document.createElement("img");
            image.src = result.urls.small;
            image.alt = result.alt_description;

            // Create a link to the image source
            const imageLink = document.createElement("a");
            imageLink.href = result.links.html;
            imageLink.target = "_blank";
            imageLink.textContent = result.alt_description;

            // Append image and link to the container
            imageWrapper.appendChild(image);
            imageWrapper.appendChild(imageLink);

            // Create a button to download the image
            const downloadButton = document.createElement("button");
            downloadButton.className = "download-button";
            downloadButton.textContent = "Download";

            try {
                // Fetch the full-size image for download
                const response = await fetch(result.urls.full);
                const blob = await response.blob();

                // Create an object URL for the Blob
                const blobUrl = window.URL.createObjectURL(blob);

                // Set up the download link
                downloadButton.addEventListener("click", () => {
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = `${result.alt_description}.jpg`;
                    a.style.display = "none";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(blobUrl);
                });
            } catch (downloadError) {
                console.error("Error downloading image:", downloadError);
            }

            // Append download button to the container
            imageWrapper.appendChild(downloadButton);

            // Create a button to hide the image
            const hideButton = document.createElement("button");
            hideButton.className = "hide-button";
            hideButton.textContent = "Hide";
            hideButton.addEventListener("click", () => {
                imageWrapper.style.display = "none";
            });

            // Append hide button to the container
            imageWrapper.appendChild(hideButton);

            // Append the container to the search results
            searchResults.appendChild(imageWrapper);
        });

        // Increment the page number for pagination
        page++;
        if (page > 1) {
            showMore.style.display = "block";
        }
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Event listener for the search form submission
formE1.addEventListener("submit", (event) => {
    event.preventDefault();
    // Reset page number to 1 and perform a new search
    page = 1;
    searchImages();
});

// Event listener for the Show more button click
showMore.addEventListener("click", () => {
    // Perform a new search when the "Show More" button is clicked
    searchImages();
});

// Event listener for the Clear button click
clearButton.addEventListener("click", () => {
    // Clear the input field
    inputE1.value = '';
});
