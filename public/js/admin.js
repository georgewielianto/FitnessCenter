document.getElementById('addClassForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // You can add JavaScript code here to handle form submission, like sending data to server or performing other actions.
    // For simplicity, I'm not implementing the actual submission logic here.
    alert('Class added successfully!');
    document.getElementById('addClassForm').reset(); // Reset form after submission
  });