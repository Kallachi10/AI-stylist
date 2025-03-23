document.addEventListener("DOMContentLoaded", function () {
    const uploadBtn = document.querySelector(".upload-btn");
    const fileInput = document.getElementById("imageUpload");

    // When the upload button is clicked, trigger the file input
    uploadBtn.addEventListener("click", function () {
        fileInput.click();
    });

    // Function to preview the uploaded image
    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            previewImage(file);
            uploadImage(file);
        }
    });
});

// Function to preview the uploaded image
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// Function to send the image to Flask backend
function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    fetch("https://your-flask-app.onrender.com/upload", {  // Replace with your actual Render backend URL
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        alert("Image uploaded successfully!");
    })
    .catch(error => {
        console.error("Error uploading image:", error);
        alert("Upload failed!");
    });
}
