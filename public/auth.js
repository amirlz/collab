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
        const response = await fetch("/api/auth/register", {
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
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful! Redirecting to dashboard...");

            localStorage.setItem("userId", data.user.id || data.user._id); // support both formats
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);

            if (data.user.role === "admin") {
        window.location.href = "admin-dashboard.html";
    }       else {
        window.location.href = "dashboard.html";
    } 
    console.log("USER ROLE:", data.user.role);
    console.log("User ID:", data.user.id || data.user._id);
    console.log("User Role:", data.user.role);

        } 
        else {
            alert("❌ Error: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
