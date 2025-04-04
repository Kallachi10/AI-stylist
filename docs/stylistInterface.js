let selectedGender = ""; // Global variable to store selected gender

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageUpload");
    const genderSelect = document.getElementById("gender"); // Gender dropdown
    const statusText = document.getElementById("statusText");
    const outfitSuggestions = document.getElementById("outfitSuggestions");
    const outfitGrid = document.getElementById("outfitGrid");

    // Store gender when selected
    genderSelect.addEventListener("change", function (event) {
        selectedGender = event.target.value;
        console.log("Selected gender:", selectedGender); // You can remove this after testing
    });

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
    reader.onload = function (e) {
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
    statusText.style.color = "white";

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
            statusText.style.color = "white";

            // Fetch outfit recommendations
            getOutfitRecommendations(skinType);
        }
    })
    .catch(error => {
        statusText.innerText = "Upload failed! Please try again.";
        statusText.style.color = "red";
    });
}

// Function to fetch outfit recommendations
function getOutfitRecommendations(skinType) {
    const outfitSuggestions = document.getElementById("outfitSuggestions");
    const outfitGrid = document.getElementById("outfitGrid");

    outfitSuggestions.innerText = "Fetching personalized outfits...";
    outfitSuggestions.style.color = "white";

    fetch("https://gem-backend-du76.onrender.com/get_outfit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            skin_type: skinType,
            gender: selectedGender // Send gender if needed
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            outfitSuggestions.innerText = `Error: ${data.error}`;
            outfitSuggestions.style.color = "red";
            return;
        }

        outfitSuggestions.innerText = `Here are your personalized outfit suggestions based on color theory:`;
        outfitSuggestions.style.color = "white";

        outfitGrid.innerHTML = ""; // Clear previous outfits

        try {
            const jsonString = data.recommendations.match(/```json\n([\s\S]*)\n```/);
            if (!jsonString) throw new Error("Invalid JSON format in response!");

            const recommendations = JSON.parse(jsonString[1]);

            Object.entries(recommendations).forEach(([category, outfit]) => {
                const outfitCard = document.createElement("div");
                outfitCard.classList.add("card");

                outfitCard.innerHTML = `
                    <h3>${category.replace("_", " ").toUpperCase()}</h3>
                    <p><strong>Outfit:</strong> ${outfit.outfit}</p>
                    <p><strong>Recommended Colors:</strong> ${outfit.colors.join(", ")}</p>
                `;

                outfitGrid.appendChild(outfitCard);
            });

        } catch (error) {
            outfitSuggestions.innerText = "Error processing outfit recommendations!";
            outfitSuggestions.style.color = "red";
            console.error("❌ JSON Parsing Error:", error);
        }
    })
    .catch(error => {
        outfitSuggestions.innerText = "Failed to get outfit recommendations!";
        outfitSuggestions.style.color = "red";
        console.error("❌ Fetch Error:", error);
    });
}
