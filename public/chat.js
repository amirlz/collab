// chat.js

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User not logged in.");
    return;
  }

  const contactsMap = {};
  const socket = io();
  socket.emit("join", userId);

  const chatIcon = document.getElementById("chat-icon");
  const chatModal = document.getElementById("chat-modal");
  const closeChatBtn = document.getElementById("close-chat");
  const chatMessagesContainer = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendMessageBtn = document.getElementById("send-message");
  const onlineStatus = document.getElementById("online-status");
  const chatContactsContainer = document.getElementById("chat-contacts");

  const ndaIcon = document.getElementById("nda-icon");
  const ndaModal = document.getElementById("nda-modal");
  const closeNdaBtn = document.getElementById("close-nda");
  const signNdaBtn = document.getElementById("sign-nda-btn");

  const signatureModal = document.getElementById("signature-modal");
  const signerNameA = document.getElementById("signer-name-a");
  const signerNameB = document.getElementById("signer-name-b");

  // NDA Logic
  ndaIcon.addEventListener("click", () => {
    ndaModal.classList.remove("hidden");
  });

  closeNdaBtn.addEventListener("click", () => {
    ndaModal.classList.add("hidden");
  });

  signNdaBtn.addEventListener("click", async () => {
    const receiverId = localStorage.getItem("activeChatReceiver");
    if (!receiverId) {
      alert("Please select a contact to sign an NDA with.");
      return;
    }

    window.currentSigner = {
      userId,
      receiverId
    };

    try {
      const res = await fetch(`/api/connections/connected/${userId}`);
      const contacts = await res.json();
      const receiver = contacts.find(c => c._id === receiverId);
      if (receiver) signerNameA.innerText = receiver.name;
      signerNameB.innerText = localStorage.getItem("username") || "Vous";
    } catch (err) {
      console.warn("Couldn't load names:", err);
    }

    ndaModal.classList.add("hidden");
    signatureModal.classList.remove("hidden");
  });

  chatIcon.addEventListener("click", () => {
    chatModal.classList.remove("hidden");
    fetchConnectedUsers().then(() => {
      const activeReceiver = localStorage.getItem("activeChatReceiver");
      if (activeReceiver) loadChatHistory(userId, activeReceiver);
    });
  });

  closeChatBtn.addEventListener("click", () => {
    chatModal.classList.add("hidden");
  });

  function appendMessage(message, senderLabel) {
    const messageElem = document.createElement("div");
    messageElem.classList.add("chat-message");
    const senderName = senderLabel === "You" ? "<strong>You</strong>" : `<strong>${contactsMap[senderLabel] || senderLabel}</strong>`;
    messageElem.innerHTML = `${senderName}: ${message}`;
    chatMessagesContainer.appendChild(messageElem);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  sendMessageBtn.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (!message) return;
    const receiverId = localStorage.getItem("activeChatReceiver");
    if (!receiverId) return alert("Please select a contact to chat with.");

    socket.emit("sendMessage", { senderId: userId, receiverId, message });
    appendMessage(message, "You");
    chatInput.value = "";
  });

  socket.on("receiveMessage", (data) => {
    if (data.senderId === userId) return;
    appendMessage(data.message, data.senderId);
  });

  socket.on("connect", () => { if (onlineStatus) onlineStatus.innerText = "Online"; });
  socket.on("disconnect", () => { if (onlineStatus) onlineStatus.innerText = "Offline"; });

  async function fetchChatHistory(senderId, receiverId) {
    try {
      const response = await fetch(`/api/messages?senderId=${senderId}&receiverId=${receiverId}`);
      if (!response.ok) throw new Error(`Failed to fetch chat history: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Error fetching chat history:", error);
      return [];
    }
  }

  async function loadChatHistory(senderId, receiverId) {
    chatMessagesContainer.innerHTML = "";
    const history = await fetchChatHistory(senderId, receiverId);
    history.forEach(msg => {
      const label = msg.senderId === senderId ? "You" : msg.senderId;
      appendMessage(msg.message, label);
    });
  }

  async function fetchConnectedUsers() {
    try {
      const res = await fetch(`/api/connections/connected/${userId}`);
      const users = await res.json();
      renderConnectedUsers(users);
    } catch (error) {
      console.error("❌ Error fetching connected users:", error);
    }
  }

  function renderConnectedUsers(users) {
    chatContactsContainer.innerHTML = `<h3>Your Contacts</h3>`;
    if (!Array.isArray(users) || users.length === 0) {
      chatContactsContainer.innerHTML += "<p>No connected users.</p>";
      return;
    }

    users.forEach(user => {
      contactsMap[user._id] = user.name;
      const contactDiv = document.createElement("div");
      contactDiv.classList.add("chat-contact");
      contactDiv.innerHTML = `
        <strong>${user.name}</strong><br>
        ${user.university || ""} ${user.faculty ? "- " + user.faculty : ""}<br>
        ${Array.isArray(user.skills) ? "Skills: " + user.skills.join(", ") : ""}
      `;
      contactDiv.addEventListener("click", () => {
        localStorage.setItem("activeChatReceiver", user._id);
        document.querySelectorAll(".chat-contact").forEach(el => el.classList.remove("active-contact"));
        contactDiv.classList.add("active-contact");
        chatMessagesContainer.innerHTML = "";
        loadChatHistory(userId, user._id);
      });
      chatContactsContainer.appendChild(contactDiv);
    });
  }
});
