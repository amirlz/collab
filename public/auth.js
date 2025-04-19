document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const requestData = { name, email, password };

    try {
        const response = await fetch("http://localhost:5001/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful! Redirecting to profile completion...");
            localStorage.setItem("userId", data.user._id);
            localStorage.setItem("token", data.token);
            window.location.href = "profile.html";
        } else {
            alert("❌ Error: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Something went wrong. Please try again.");
    }
});

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const requestData = { email, password };

    try {
        const response = await fetch("http://localhost:5001/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful! Redirecting to dashboard...");
            localStorage.setItem("userId", data.user._id);
            localStorage.setItem("token", data.token);
            window.location.href = "dashboard.html"; 
        } else {
            alert("❌ Error: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
