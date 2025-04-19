document.getElementById("profile-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = localStorage.getItem("userId");
    const educationLevel = document.getElementById("education").value;
    const university = document.getElementById("university").value;
    const faculty = document.getElementById("faculty").value;
    const department = document.getElementById("department").value;
    const skills = document.getElementById("skills").value.split(",").map(skill => skill.trim());

    // Map educationLevel to education, as expected by the backend.
    const requestData = { 
        userId, 
        education: educationLevel, 
        university, 
        faculty, 
        department, 
        skills 
    };

    try {
        const response = await fetch("/api/auth/complete-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Profile completed successfully! Redirecting to dashboard...");
            window.location.href = "dashboard.html";
        } else {
            alert("❌ Error: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
