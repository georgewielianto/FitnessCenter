document.addEventListener("DOMContentLoaded", function() {
  const addClassForm = document.getElementById("addClassForm");
  const addTrainerForm = document.getElementById("addTrainerForm"); // Tambahkan

  addClassForm.addEventListener("submit", function(event) {
    event.preventDefault();

    //add class
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
      }
    })
    .catch(error => {
      console.error("Error adding class:", error);
    });
  });

  // Tambahkan kode untuk menambahkan trainer
  addTrainerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    //add trainer
    const trainerName = document.getElementById("trainerName").value;
    const trainerDesc = document.getElementById("trainerDesc").value;
    const trainerImageUrl = document.getElementById("trainerImg").value;
    

    fetch("/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        trainerName: trainerName,
        trainerDesc: trainerDesc,
        trainerImg: trainerImageUrl
      })
    })
    .then(response => {
      if (response.ok) {
        console.log("Trainer added successfully!");
        const successMessage = document.createElement("p");
        successMessage.textContent = "Success added trainer";
        addTrainerForm.appendChild(successMessage);
      } else {
        console.error("Failed to add trainer.");
      }
    })
    .catch(error => {
      console.error("Error adding trainer:", error);
    });
  });
});
