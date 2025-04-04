let selectedGender = "";
const MODEL_LAB_API_KEY = "jX13rIqAzfaSQuSEcmE03OgOLf118nebU1mBMflXCLaKWaItNVzNrOfx3zTg"; // Replace with your actual Modelslab API key

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageUpload");
    const genderSelect = document.getElementById("gender");
    const statusText = document.getElementById("statusText");
    const outfitSuggestions = document.getElementById("outfitSuggestions");
    const outfitGrid = document.getElementById("outfitGrid");

    genderSelect.addEventListener("change", function (event) {
        selectedGender = event.target.value;
    });

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            previewImage(file);
            uploadImage(file);
        }
    });
});

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

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

            getOutfitRecommendations(skinType);
        }
    })
    .catch(error => {
        statusText.innerText = "Upload failed! Please try again.";
        statusText.style.color = "red";
    });
}

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
            gender: selectedGender
        })
    })
    .then(response => response.json())
    .then(async data => {
        if (data.error) {
            outfitSuggestions.innerText = `Error: ${data.error}`;
            outfitSuggestions.style.color = "red";
            return;
        }

        outfitSuggestions.innerText = `Here are your personalized outfit suggestions:`;
        outfitSuggestions.style.color = "white";
        outfitGrid.innerHTML = "";

        try {
            const jsonString = data.recommendations.match(/```json\n([\s\S]*)\n```/);
            if (!jsonString) throw new Error("Invalid JSON format in response!");

            const recommendations = JSON.parse(jsonString[1]);

            for (const [category, outfit] of Object.entries(recommendations)) {
                const outfitCard = document.createElement("div");
                outfitCard.classList.add("card");

                outfitCard.innerHTML = `
                    <h3>${category.replace("_", " ").toUpperCase()}</h3>
                    <p><strong>Outfit:</strong> ${outfit.outfit}</p>
                    <p><strong>Recommended Colors:</strong> ${outfit.colors.join(", ")}</p>
                    <p><em>Generating preview...</em></p>
                `;

                outfitGrid.appendChild(outfitCard);

                const genderPrompt = selectedGender?.toLowerCase() || "person";

                // Filter out accessories like heels or shoes
                const filteredClothing = outfit.outfit.split(", ").filter(item => !/dress|shirts|pants|top|shirt|pant/i.test(item));
                const firstClothing = filteredClothing.length > 0 ? filteredClothing[0] : outfit.outfit;
                const clothingWords = firstClothing.split(" ");
                const clothingType = clothingWords[clothingWords.length - 1] || "outfit";

                const color = outfit.colors?.[0] || "blue";
                const fullPrompt = `A ${genderPrompt} person wearing a ${color} ${clothingType}`;

                // Display prompt for testing
                outfitCard.innerHTML += `<p><strong>Prompt:</strong> ${fullPrompt}</p>`;

                try {
                    const imageRes = await fetch("https://modelslab.com/api/v6/realtime/text2img", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            key: MODEL_LAB_API_KEY,
                            prompt: fullPrompt,
                            width: 512,
                            height: 512,
                            samples: 1,
                            safety_checker: true,
                            seed: null,
                            instant_response: false,
                            base64: false,
                            webhook: null
                        })
                    });

                    const imageData = await imageRes.json();
                    const imageUrl = imageData.image_url || (imageData.output && imageData.output[0]);

                    if (imageUrl) {
                        const img = document.createElement("img");
                        img.src = imageUrl;
                        img.alt = "Generated outfit preview";
                        img.style.width = "100%";
                        img.style.marginTop = "10px";
                        outfitCard.appendChild(img);
                    } else {
                        outfitCard.innerHTML += `<p style="color:red;">❌ Failed to generate image.</p>`;
                    }
                } catch (err) {
                    console.error("Error generating image:", err);
                    outfitCard.innerHTML += `<p style="color:red;">❌ Error generating image.</p>`;
                }
            }

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
