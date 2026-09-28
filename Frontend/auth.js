const setResult = (message, isError = false) => {
    const result = document.getElementById("authResult");
    if (!result) return;
    result.innerHTML = `
        <p style="color:${isError ? "#ff4d6d" : "#10b981"}; margin-top: 12px; font-weight: 500;">
            ${message}
        </p>
    `;
};

// Check if user is already logged in
if (localStorage.getItem("loggedIn") === "true") {
    // If already logged in, redirect to main dashboard
    window.location.href = "index.html";
}

function signupUser() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
        setResult("Please fill in all signup details (Name, Email, Password).", true);
        return;
    }

    if (password.length < 6) {
        setResult("Password should be at least 6 characters.", true);
        return;
    }

    const existingUser = JSON.parse(localStorage.getItem("finpulseUser") || "null");

    if (existingUser && existingUser.email.toLowerCase() === email.toLowerCase()) {
        setResult("This email is already registered. Please log in.", true);
        return;
    }

    const user = { name, email, password };
    localStorage.setItem("finpulseUser", JSON.stringify(user));
    setResult("Signup successful! You can now log in. ✅");

    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

    // Pre-fill login email for convenience
    document.getElementById("loginEmail").value = email;
}

function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        setResult("Please enter both email and password.", true);
        return;
    }

    const savedUser = JSON.parse(localStorage.getItem("finpulseUser") || "null");

    if (!savedUser) {
        setResult("No registered user found. Please create an account first.", true);
        return;
    }

    if (savedUser.email.toLowerCase() === email.toLowerCase() && savedUser.password === password) {
        setResult("Login successful! Redirecting... ✅");
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInUser", JSON.stringify(savedUser));

        setTimeout(() => {
            window.location.href = "index.html";
        }, 600);
    } else {
        setResult("Invalid email or password. Please try again.", true);
    }
}