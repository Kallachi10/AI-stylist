document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageUpload");
    const statusText = document.getElementById("statusText");

    // Listen for changes on the file input
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
    reader.onload = function(e) {
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    // Show uploading indicator
    const statusText = document.getElementById("statusText");
    statusText.innerText = "Uploading...";
    statusText.style.color = "blue";

    fetch("https://ai-stylist-hw5f.onrender.com/upload", {  
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        if (data.error) {
            statusText.innerText = `Error: ${data.error}`;
            statusText.style.color = "red";
        } else {
            statusText.innerText = `Detected Skin Tone: ${data.fitzpatrick_type}`;
            statusText.style.color = "green";
        }
    })
    .catch(error => {
        console.error("Error uploading image:", error);
        statusText.innerText = "Upload failed! Please try again.";
        statusText.style.color = "red";
    });
}
