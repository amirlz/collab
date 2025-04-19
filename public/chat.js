// chat.js
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the logged-in user's ID from localStorage
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User not logged in.");
    return;
  }

  // Global mapping for connected users: { userId: userName, ... }
  const contactsMap = {};

  // Initialize Socket.io connection (ensure Socket.io client is loaded via CDN in dashboard.html)
  const socket = io();
  socket.emit("join", userId);

  // Get DOM elements for chat functionality
  const chatIcon = document.getElementById("chat-icon");                   // Chat icon in navbar
  const chatModal = document.getElementById("chat-modal");                   // Chat modal popup
  const closeChatBtn = document.getElementById("close-chat");                // Button to close chat modal
  const chatMessagesContainer = document.getElementById("chat-messages");      // Container for chat messages
  const chatInput = document.getElementById("chat-input");                   // Input for typing messages
  const sendMessageBtn = document.getElementById("send-message");              // Button to send message
  const onlineStatus = document.getElementById("online-status");               // Online status indicator
  const chatContactsContainer = document.getElementById("chat-contacts");      // Container for connected users

  // NDA DOM Elements
  const ndaIcon = document.getElementById("nda-icon");                       // NDA icon in chat modal
  const ndaModal = document.getElementById("nda-modal");                     // NDA modal popup
  const closeNdaBtn = document.getElementById("close-nda");                  // Button to close NDA modal
  const signNdaBtn = document.getElementById("sign-nda-btn");                // Button to sign NDA

  // ---------------- NDA Modal Logic ----------------

  // Show NDA modal when the NDA icon is clicked
  ndaIcon.addEventListener("click", () => {
    console.log("NDA icon clicked");
    ndaModal.classList.remove("hidden");
  });

  // Close NDA modal when close button is clicked
  closeNdaBtn.addEventListener("click", () => {
    ndaModal.classList.add("hidden");
  });

  // Handle NDA signing: sends a POST request to sign the NDA
  signNdaBtn.addEventListener("click", async () => {
    // Get the active chat receiver
    const receiverId = localStorage.getItem("activeChatReceiver");
    if (!receiverId) {
      alert("Please select a contact to sign an NDA with.");
      return;
    }
    try {
      const response = await fetch("/api/nda/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, receiverId })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to sign NDA.");
      }
      alert(result.message || "NDA signed successfully!");
      ndaModal.classList.add("hidden");
    } catch (error) {
      console.error("❌ Error signing NDA:", error);
      alert("Something went wrong while signing NDA. Please try again later.");
    }
  });

  // ---------------- Chat Modal Logic ----------------

  // Open chat modal when chat icon is clicked
  chatIcon.addEventListener("click", () => {
    console.log("Chat icon clicked");
    chatModal.classList.remove("hidden");
    // When opening the chat modal, fetch connected users and load chat history if a contact is active.
    fetchConnectedUsers().then(() => {
      const activeReceiver = localStorage.getItem("activeChatReceiver");
      if (activeReceiver) {
        loadChatHistory(userId, activeReceiver);
      }
    });
  });

  // Close chat modal when close button is clicked
  closeChatBtn.addEventListener("click", () => {
    chatModal.classList.add("hidden");
  });

  // Append a message to the chat messages container, using bold for sender name
  function appendMessage(message, senderLabel) {
    const messageElem = document.createElement("div");
    messageElem.classList.add("chat-message");

    let displayLabel = senderLabel;
    if (senderLabel === "You") {
      displayLabel = "<strong>You</strong>";
    } else {
      // Look up sender's name from contactsMap if available; fallback to senderLabel if not found
      const senderName = contactsMap[senderLabel] || senderLabel;
      displayLabel = `<strong>${senderName}</strong>`;
    }
    messageElem.innerHTML = `${displayLabel}: ${message}`;
    chatMessagesContainer.appendChild(messageElem);
    // Auto-scroll to the bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // Handle sending a message when send button is clicked
  sendMessageBtn.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (!message) return;

    // Retrieve the active chat receiver from localStorage
    const receiverId = localStorage.getItem("activeChatReceiver");
    if (!receiverId) {
      alert("Please select a contact to chat with.");
      return;
    }

    // Emit the "sendMessage" event via Socket.io
    socket.emit("sendMessage", { senderId: userId, receiverId, message });
    appendMessage(message, "You");
    chatInput.value = "";
  });

  // Listen for incoming messages from the server
  socket.on("receiveMessage", (data) => {
    // Avoid duplicating your own sent messages
    if (data.senderId === userId) return;
    // Display the incoming message using the sender's name (looked up via contactsMap)
    appendMessage(data.message, data.senderId);
  });

  // Update online status based on connection events
  socket.on("connect", () => {
    if (onlineStatus) onlineStatus.innerText = "Online";
  });
  socket.on("disconnect", () => {
    if (onlineStatus) onlineStatus.innerText = "Offline";
  });

  // ---------------- Chat History Functions ----------------

  // Fetch chat history between the logged-in user and a specific receiver
  async function fetchChatHistory(senderId, receiverId) {
    try {
      const response = await fetch(`/api/messages?senderId=${senderId}&receiverId=${receiverId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`);
      }
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error("❌ Error fetching chat history:", error);
      return [];
    }
  }

  // Load and render chat history in the chat messages container
  async function loadChatHistory(senderId, receiverId) {
    // Clear previous messages
    chatMessagesContainer.innerHTML = "";
    const history = await fetchChatHistory(senderId, receiverId);
    history.forEach(msg => {
      const label = msg.senderId === senderId ? "You" : msg.senderId;
      appendMessage(msg.message, label);
    });
  }

  // ---------------- Connected Users (Contacts) ----------------

  // Fetch connected users (contacts) from the backend
  async function fetchConnectedUsers() {
    try {
      const response = await fetch(`/api/connections/connected/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch connected users: ${response.status} ${response.statusText}`);
      }
      const connectedUsers = await response.json();
      console.log("Connected Users:", connectedUsers);
      renderConnectedUsers(connectedUsers);
    } catch (error) {
      console.error("❌ Error fetching connected users:", error);
    }
  }

  // Render the list of connected users in the chat contacts container
  function renderConnectedUsers(users) {
    // Clear previous contacts list (but keep the header)
    chatContactsContainer.innerHTML = `<h3>Your Contacts</h3>`;
    
    if (!Array.isArray(users) || users.length === 0) {
      const noContacts = document.createElement("p");
      noContacts.innerText = "No connected users.";
      chatContactsContainer.appendChild(noContacts);
      return;
    }

    // Create a list of contacts and update the contactsMap
    users.forEach(user => {
      // Add to the contactsMap so we can reference the user's name later
      contactsMap[user._id] = user.name;

      const contactDiv = document.createElement("div");
      contactDiv.classList.add("chat-contact");
      contactDiv.innerHTML = `
        <strong>${user.name}</strong><br>
        ${user.university || ""} ${user.faculty ? "- " + user.faculty : ""}<br>
        ${Array.isArray(user.skills) ? "Skills: " + user.skills.join(", ") : ""}
      `;
      
      // When a contact is clicked, set it as the active chat receiver and load chat history
      contactDiv.addEventListener("click", () => {
        localStorage.setItem("activeChatReceiver", user._id);
        // Highlight the selected contact
        document.querySelectorAll(".chat-contact").forEach(el => el.classList.remove("active-contact"));
        contactDiv.classList.add("active-contact");
        // Clear previous chat messages and load the history for the selected contact
        chatMessagesContainer.innerHTML = "";
        loadChatHistory(userId, user._id);
        console.log(`Active chat receiver set to: ${user._id}`);
      });

      chatContactsContainer.appendChild(contactDiv);
    });
  }
});
