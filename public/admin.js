// admin.js - Frontend logic for admin-dashboard.html

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token) {
    alert("Access denied. You must log in as an admin.");
    window.location.href = "index.html";
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const userListContainer = document.getElementById("all-users-list");
  const selectedDetails = {
    name: document.getElementById("selected-name"),
    email: document.getElementById("selected-email"),
    role: document.getElementById("selected-role"),
    list: document.getElementById("connected-users-list"),
    deleteBtn: document.getElementById("delete-user-btn"),
    editBtn: document.getElementById("edit-user-btn"),
  };

  let selectedUserId = null;
  let selectedUser = null;

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", { headers });
      const users = await res.json();

      userListContainer.innerHTML = "";

      users.forEach((user) => {
        const card = document.createElement("div");
        card.classList.add("student-card");
        card.innerHTML = `
          <img src="photos/profile-1png.png" alt="User" />
          <div>
            <p><strong>${user.name}</strong></p>
            <p>Email: ${user.email}</p>
            <p>University: ${user.university}</p>
            <p>Faculty: ${user.faculty}</p>
            <p>Department: ${user.department}</p>
            <p>Education: ${user.educationLevel}</p>
            <p>Skills: ${user.skills.join(", ")}</p>
            <button class="connect-btn view-btn" data-id="${user._id}">View</button>
          </div>
        `;
        userListContainer.appendChild(card);
      });

      // Attach click listeners for "View" buttons
      document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          console.log("🔍 Clicked user ID:", id);
          loadUserDetails(id);
        });
      });
    } catch (err) {
      console.error("Failed to load users:", err);
      alert("Error fetching users");
    }
  }

  async function loadUserDetails(id) {
    selectedUserId = id;
    try {
      const [connectionsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/users/${id}/connections`, { headers }),
        fetch(`/api/admin/users`, { headers }),
      ]);

      const userList = await usersRes.json();
      selectedUser = userList.find((u) => u._id === id);

      if (!selectedUser) throw new Error("User not found");

      selectedDetails.name.textContent = selectedUser.name;
      selectedDetails.email.textContent = selectedUser.email;
      selectedDetails.role.textContent = selectedUser.role;

      const connections = await connectionsRes.json();
      selectedDetails.list.innerHTML = "";

      if (connections.length === 0) {
        selectedDetails.list.innerHTML = "<li>No connections</li>";
      } else {
        connections.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = `${c.name} (${c.email})`;
          selectedDetails.list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Failed to load user details:", err);
      alert("Could not load user data");
    }
  }

  selectedDetails.deleteBtn.addEventListener("click", async () => {
    if (!selectedUserId) {
      alert("No user selected.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Failed to delete user");

      alert("User deleted successfully.");
      selectedUserId = null;
      selectedUser = null;
      selectedDetails.name.textContent = "";
      selectedDetails.email.textContent = "";
      selectedDetails.role.textContent = "";
      selectedDetails.list.innerHTML = "";
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete user.");
    }
  });

  selectedDetails.editBtn.addEventListener("click", () => {
    if (!selectedUser) {
      alert("No user selected to edit.");
      return;
    }

    document.getElementById("edit-name").value = selectedUser.name || "";
    document.getElementById("edit-email").value = selectedUser.email || "";
    document.getElementById("edit-education").value = selectedUser.educationLevel || "";
    document.getElementById("edit-university").value = selectedUser.university || "";
    document.getElementById("edit-faculty").value = selectedUser.faculty || "";
    document.getElementById("edit-department").value = selectedUser.department || "";
    document.getElementById("edit-skills").value = (selectedUser.skills || []).join(", ");

    document.getElementById("profile-modal").classList.remove("hidden");
  });

  document.getElementById("profile-edit-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!selectedUserId) return;

    const updatedData = {
      name: document.getElementById("edit-name").value,
      email: document.getElementById("edit-email").value,
      educationLevel: document.getElementById("edit-education").value,
      university: document.getElementById("edit-university").value,
      faculty: document.getElementById("edit-faculty").value,
      department: document.getElementById("edit-department").value,
      skills: document.getElementById("edit-skills").value.split(",").map(skill => skill.trim()),
    };

    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Profile updated successfully");
      document.getElementById("profile-modal").classList.add("hidden");
      fetchUsers(); // Refresh UI
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Failed to update user profile.");
    }
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    document.getElementById("profile-modal").classList.add("hidden");
  });

  fetchUsers(); // Initial fetch
});
