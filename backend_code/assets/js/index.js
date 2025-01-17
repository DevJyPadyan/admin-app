
const predefinedUsername = "admin"; 
const predefinedPassword = "admin123";


document.querySelector(".btn.btn-animation").addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the entered username and password
  const enteredUsername = document.querySelector('input[name="email"]').value;
  const enteredPassword = document.querySelector('input[name="password"]').value;

  // Validate the username and password
  if (enteredUsername === predefinedUsername && enteredPassword === predefinedPassword) {
    alert("Login successful!");

    window.location.href = "dashboard.html";
  } else {
    alert("Invalid username or password. Please try again.");
  }
});
