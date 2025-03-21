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
            const reader = new FileReader();
            reader.onload = function (e) {
                const imagePreview = document.getElementById("imagePreview");
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });
});
