// profile.js
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User not logged in.");
      return;
    }
  
    // Get DOM elements for profile functionality
    const profileIcon = document.getElementById("profile-icon");
    const profileModal = document.getElementById("profile-modal");
    const closeProfileBtn = document.getElementById("close-profile");
  
    const profileDisplay = document.getElementById("profile-display");
    const profileNameSpan = document.getElementById("profile-name");
    const profileEmailSpan = document.getElementById("profile-email");
    const profileEducationSpan = document.getElementById("profile-education");
    const profileUniversitySpan = document.getElementById("profile-university");
    const profileFacultySpan = document.getElementById("profile-faculty");
    const profileDepartmentSpan = document.getElementById("profile-department");
    const profileSkillsSpan = document.getElementById("profile-skills");
    const editProfileBtn = document.getElementById("edit-profile-btn");
  
    const profileEditForm = document.getElementById("profile-edit-form");
    const editNameInput = document.getElementById("edit-name");
    const editEmailInput = document.getElementById("edit-email");
    const editEducationInput = document.getElementById("edit-education");
    const editUniversityInput = document.getElementById("edit-university");
    const editFacultyInput = document.getElementById("edit-faculty");
    const editDepartmentInput = document.getElementById("edit-department");
    const editSkillsInput = document.getElementById("edit-skills");
    const saveProfileBtn = document.getElementById("save-profile-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
  
    // Open profile modal on profile icon click
    profileIcon.addEventListener("click", async () => {
      console.log("Profile icon clicked");
      await fetchUserProfile(userId);
      profileModal.classList.remove("hidden");
    });
  
    // Close profile modal when close button is clicked
    closeProfileBtn.addEventListener("click", () => {
      profileModal.classList.add("hidden");
    });
  
    // Switch to edit mode
    editProfileBtn.addEventListener("click", () => {
      profileDisplay.classList.add("hidden");
      profileEditForm.classList.remove("hidden");
    });
  
    // Cancel edit mode
    cancelEditBtn.addEventListener("click", () => {
      profileEditForm.classList.add("hidden");
      profileDisplay.classList.remove("hidden");
    });
  
    // Save changes to profile
    profileEditForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updatedData = {
        name: editNameInput.value.trim(),
        email: editEmailInput.value.trim(),
        education: editEducationInput.value.trim(),
        university: editUniversityInput.value.trim(),
        faculty: editFacultyInput.value.trim(),
        department: editDepartmentInput.value.trim(),
        skills: editSkillsInput.value.trim().split(",").map(s => s.trim())
      };
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData)
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to update profile.");
        }
        alert("Profile updated successfully!");
        profileEditForm.classList.add("hidden");
        profileDisplay.classList.remove("hidden");
        setProfileDisplay(result);
      } catch (error) {
        console.error("❌ Error updating profile:", error);
        alert("Something went wrong while updating profile. Please try again later.");
      }
    });
  
    // Helper function to fetch user profile data
    async function fetchUserProfile(uId) {
      try {
        const response = await fetch(`/api/users/${uId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        const userData = await response.json();
        setProfileDisplay(userData);
        setEditFormValues(userData);
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
      }
    }
  
    // Update the read-only profile display
    function setProfileDisplay(user) {
      profileNameSpan.textContent = user.name || "";
      profileEmailSpan.textContent = user.email || "";
      profileEducationSpan.textContent = user.education || "";
      profileUniversitySpan.textContent = user.university || "";
      profileFacultySpan.textContent = user.faculty || "";
      profileDepartmentSpan.textContent = user.department || "";
      profileSkillsSpan.textContent = Array.isArray(user.skills) ? user.skills.join(", ") : "";
    }
  
    // Populate the edit form fields
    function setEditFormValues(user) {
      editNameInput.value = user.name || "";
      editEmailInput.value = user.email || "";
      editEducationInput.value = user.education || "";
      editUniversityInput.value = user.university || "";
      editFacultyInput.value = user.faculty || "";
      editDepartmentInput.value = user.department || "";
      editSkillsInput.value = Array.isArray(user.skills) ? user.skills.join(", ") : "";
      // Ensure display mode is active by default
      profileDisplay.classList.remove("hidden");
      profileEditForm.classList.add("hidden");
    }
  });
  