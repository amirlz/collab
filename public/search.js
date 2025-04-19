document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    if (!searchInput || !searchBtn) {
        console.error("❌ Search elements not found in the DOM.");
        return;
    }

    searchBtn.addEventListener("click", function (event) {
        event.preventDefault();
        searchStudents(searchInput.value.trim());
    });
});

async function searchStudents(query) {
    if (!query) {
        alert("Please enter a search term.");
        return;
    }

    try {
        // ✅ Send the search term to the backend
        // For example, in search.js:
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);


        if (!response.ok) {
            throw new Error("Failed to fetch search results");
        }

        const students = await response.json();
        displaySearchResults(students);
    } catch (error) {
        console.error("❌ Search Error:", error);
        alert("Something went wrong while searching.");
    }
}

// ✅ Function to display search results
function displaySearchResults(students) {
    const studentList = document.getElementById("students-list");
    studentList.innerHTML = ""; // Clear previous results

    if (!students || students.length === 0) {
        studentList.innerHTML = "<p>No students found.</p>";
        return;
    }

    students.forEach(student => {
        const studentCard = document.createElement("div");
        studentCard.classList.add("student-card");

        studentCard.innerHTML = `
            <img src="${student.image ? student.image : 'photos/profile-1png.png'}" alt="Profile">
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>${student.university} - ${student.faculty}</p>
                <p><strong>Skills:</strong> ${student.skills?.join(", ") || "N/A"}</p>
                <button class="connect-btn">Connect</button>
            </div>
        `;

        studentList.appendChild(studentCard);
    });
}
