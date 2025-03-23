function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file); // Ensure this matches your Flask backend key

    // Show uploading indicator
    const statusText = document.getElementById("statusText");
    statusText.innerText = "Uploading...";
    statusText.style.color = "blue";

    fetch("https://ai-stylist-hw5f.onrender.com/process-image", {  
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
