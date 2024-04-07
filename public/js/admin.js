// admin.js

document.addEventListener("DOMContentLoaded", function() {
  const addClassForm = document.getElementById("addClassForm");

  addClassForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const imageUrl = document.getElementById("imageUrl").value;

    fetch("/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        description: description,
        imageUrl: imageUrl
      })
    })
    .then(response => {
      if (response.ok) {
        console.log("Class added successfully!");
        const successMessage = document.createElement("p");
        successMessage.textContent = "Success added class";
        addClassForm.appendChild(successMessage);
      } else {
        console.error("Failed to add class.");
        // Handle error jika ada
      }
    })
    .catch(error => {
      console.error("Error adding class:", error);
    });
  });
});
