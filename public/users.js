// Wait until the DOM is fully loaded before running our code
document.addEventListener("DOMContentLoaded", fetchUsers);

let students = []; // Declare students globally

// Fetch users from the backend using a default empty query to satisfy the required parameter
async function fetchUsers() {
  try {
    console.log("Fetching users...");
    // Send an empty query so the backend accepts it
    const response = await fetch("/api/search?query=");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format: Expected an array");
    }
    
    students = data; // Store fetched students
    displayUsers(students); // Display them
  } catch (error) {
    console.error("❌ Error fetching users:", error);
  }
}

// Display the list of users on the dashboard, filtering out the logged-in user
function displayUsers(users) {
  const studentList = document.getElementById("students-list");
  studentList.innerHTML = ""; // Clear any previous content

  // Retrieve the logged-in user's ID from localStorage
  const loggedInUserId = localStorage.getItem("userId");

  // Filter out the logged-in user from the list
  const filteredUsers = users.filter(user => user._id !== loggedInUserId);

  if (!filteredUsers || filteredUsers.length === 0) {
    studentList.innerHTML = "<p>No students found.</p>";
    return;
  }

  // Loop through each filtered user and create a card for display
  filteredUsers.forEach(user => {
    const userCard = document.createElement("div");
    userCard.classList.add("student-card");

    userCard.innerHTML = `
      <img src="${user.image ? user.image : 'photos/profile-1png.png'}" alt="Profile">
      <div class="student-info">
          <h4>${user.name}</h4>
          <p>${user.university} - ${user.faculty}</p>
          <p><strong>Skills:</strong> ${Array.isArray(user.skills) ? user.skills.join(", ") : "N/A"}</p>
          <button class="connect-btn" data-userid="${user._id}">Connect</button>
      </div>
    `;

    studentList.appendChild(userCard);
  });

  // After creating all user cards, attach event listeners to the "Connect" buttons
  addConnectEventListeners();
}

// Attach click event listeners to "Connect" buttons
function addConnectEventListeners() {
  const connectButtons = document.querySelectorAll(".connect-btn");
  const loggedInUserId = localStorage.getItem("userId");

  connectButtons.forEach(button => {
    button.addEventListener("click", async () => {
      // Retrieve the receiver's ID from the data attribute
      const receiverId = button.getAttribute("data-userid");

      // Prepare the POST request payload
      const payload = {
        senderId: loggedInUserId,
        receiverId: receiverId
      };

      try {
        const response = await fetch("/api/connections/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          // Check if the connection request has already been sent
          if (result.message === "Connection request already sent.") {
            alert(result.message);
            // Disable the button and update its text to prevent duplicate requests
            button.disabled = true;
            button.innerText = "Requested";
            return;
          }
          throw new Error(result.message || "Failed to send connection request.");
        }

        // If successful, alert the user and update the button
        alert(result.message || "Connection request sent successfully!");
        button.disabled = true;
        button.innerText = "Requested";
      } catch (error) {
        console.error("❌ Error sending connection request:", error);
        alert("Something went wrong while sending the connection request. Please try again later.");
      }
    });
  });
}
