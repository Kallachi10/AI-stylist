document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageUpload");
    const statusText = document.getElementById("statusText");
    const outfitSuggestions = document.getElementById("outfitSuggestions");
    const outfitGrid = document.getElementById("outfitGrid");

    // Listen for file input change
    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            previewImage(file);
            uploadImage(file);
        }
    });
});

// Function to show uploaded image preview
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// Function to upload the image and detect skin tone
function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const statusText = document.getElementById("statusText");
    statusText.innerText = "Uploading...";
    statusText.style.color = "blue";

    fetch("https://ai-stylist-hw5f.onrender.com/upload", {  
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            statusText.innerText = `Error: ${data.error}`;
            statusText.style.color = "red";
        } else {
            const skinType = data.fitzpatrick_type;
            statusText.innerText = `Detected Skin Tone: ${skinType}`;
            statusText.style.color = "green";

            // Fetch outfit recommendations
            getOutfitRecommendations(skinType);
        }
    })
    .catch(error => {
        statusText.innerText = "Upload failed! Please try again.";
        statusText.style.color = "red";
    });
}

// Function to fetch outfit recommendations from Gemini API
function getOutfitRecommendations(skinType) {
    const outfitSuggestions = document.getElementById("outfitSuggestions");
    const outfitGrid = document.getElementById("outfitGrid");

    outfitSuggestions.innerText = "Fetching personalized outfits...";
    outfitSuggestions.style.color = "blue";

    fetch("https://gem-backend-du76.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ skin_type: skinType })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            outfitSuggestions.innerText = `Error: ${data.error}`;
            outfitSuggestions.style.color = "red";
        } else {
            outfitSuggestions.innerText = `Here are your personalized outfit suggestions based on color theory:`;
            outfitSuggestions.style.color = "green";

            // Clear previous outfits
            outfitGrid.innerHTML = "";

            // Categories: Casual, Eccentric, Kerala Traditional
            const categories = ["Casual", "Eccentric", "Classic Kerala"];
            data.recommendations.forEach((outfit, index) => {
                const outfitCard = document.createElement("div");
                outfitCard.classList.add("card");

                outfitCard.innerHTML = `
                    <h3>${categories[index]}</h3>
                    <img src="${outfit.image}" alt="${categories[index]} Outfit">
                    <p>${outfit.description}</p>
                `;

                outfitGrid.appendChild(outfitCard);
            });
        }
    })
    .catch(error => {
        outfitSuggestions.innerText = "Failed to get outfit recommendations!";
        outfitSuggestions.style.color = "red";
    });
}
