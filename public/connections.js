// connections.js
document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the logged-in user's ID from localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User not logged in.");
      return;
    }
  
    // Function to fetch pending connection requests from the backend
    async function fetchPendingRequests() {
      try {
        // Make a GET request to the backend endpoint for pending requests
        const response = await fetch(`/api/connections/pending/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch pending requests: ${response.status} ${response.statusText}`);
        }
        const pendingRequests = await response.json();
        console.log("Pending Requests:", pendingRequests);
  
        // Update the pending requests UI
        const pendingRequestsContainer = document.getElementById("pending-requests");
        pendingRequestsContainer.innerHTML = ""; // Clear existing content
  
        // Loop through each pending request object
        pendingRequests.forEach(request => {
          const div = document.createElement("div");
          div.classList.add("pending-request-card");
  
          // Display sender details. Since the backend populates with "name university skills",
          // we assume these fields exist in the object.
          const senderName = request.name || "Unknown Sender";
          const senderUniversity = request.university || "N/A";
          const senderSkills = request.skills ? request.skills.join(", ") : "N/A";
  
          // Build the inner HTML with sender information and two buttons: Accept and Reject.
          div.innerHTML = `
            <p>
              Request from: <strong>${senderName}</strong><br>
              University: ${senderUniversity}<br>
              Skills: ${senderSkills}
            </p>
            <button class="accept-btn" data-requesterid="${request._id}">Accept</button>
            <button class="reject-btn" data-requesterid="${request._id}">Reject</button>
          `;
  
          pendingRequestsContainer.appendChild(div);
        });
  
        // Attach event listeners for the Accept and Reject buttons
        attachAcceptRejectListeners();
      } catch (error) {
        console.error("❌ Error fetching pending requests:", error);
      }
    }
  
    // Function to attach Accept and Reject event listeners to buttons
    function attachAcceptRejectListeners() {
      // Accept button listeners
      const acceptButtons = document.querySelectorAll(".accept-btn");
      acceptButtons.forEach(button => {
        button.addEventListener("click", async () => {
          // Retrieve the requesterId (sender's ID) from the data attribute
          const requesterId = button.getAttribute("data-requesterid");
  
          // Prepare payload for accepting connection request
          const payload = {
            userId: userId,         // The logged-in user who is accepting the request
            requesterId: requesterId  // The sender's ID from the pending request
          };
  
          try {
            const response = await fetch("/api/connections/accept", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
  
            const result = await response.json();
  
            if (!response.ok) {
              throw new Error(result.message || "Failed to accept connection request.");
            }
  
            alert(result.message || "Connection request accepted.");
            // Refresh the pending requests list after accepting
            fetchPendingRequests();
          } catch (error) {
            console.error("❌ Error accepting connection request:", error);
            alert("Something went wrong while accepting the connection request. Please try again later.");
          }
        });
      });
  
      // Reject button listeners
      const rejectButtons = document.querySelectorAll(".reject-btn");
      rejectButtons.forEach(button => {
        button.addEventListener("click", async () => {
          // Retrieve the requesterId (sender's ID) from the data attribute
          const requesterId = button.getAttribute("data-requesterid");
  
          // Prepare payload for rejecting connection request
          const payload = {
            userId: userId,         // The logged-in user who is rejecting the request
            requesterId: requesterId  // The sender's ID from the pending request
          };
  
          try {
            const response = await fetch("/api/connections/reject", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
  
            const result = await response.json();
  
            if (!response.ok) {
              throw new Error(result.message || "Failed to reject connection request.");
            }
  
            alert(result.message || "Connection request rejected.");
            // Refresh the pending requests list after rejecting
            fetchPendingRequests();
          } catch (error) {
            console.error("❌ Error rejecting connection request:", error);
            alert("Something went wrong while rejecting the connection request. Please try again later.");
          }
        });
      });
    }
  
    // Call the function to fetch pending connection requests on page load
    fetchPendingRequests();
  });
  