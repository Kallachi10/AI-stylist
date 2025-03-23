function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file); // Use "image" instead of "file" (as per your Flask code)

    fetch("https://ai-stylist-hw5f.onrender.com/process-image", {  
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);

        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert(`Detected Skin Tone: ${data.fitzpatrick_type}`);
        }
    })
    .catch(error => {
        console.error("Error uploading image:", error);
        alert("Upload failed!");
    });
}
