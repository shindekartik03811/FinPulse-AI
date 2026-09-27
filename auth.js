// ==================== SIGNUP ====================

function signupUser() {

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    const result = document.getElementById("authResult");

    if (!name || !email || !password) {
        result.innerHTML = "Please fill all signup details.";
        return;
    }

    const existingUser = localStorage.getItem("finpulseUser");

    if (existingUser) {

        const user = JSON.parse(existingUser);

        if (user.email === email) {
            result.innerHTML = "Email already registered.";
            return;
        }
    }

    const user = {
        name: name,
        email: email,
        password: password
    };

    localStorage.setItem(
        "finpulseUser",
        JSON.stringify(user)
    );

    result.innerHTML = `
        <h3>Signup Successful! ✅</h3>
        <p>Account created successfully.</p>
    `;

    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
}


// ==================== LOGIN ====================

function loginUser() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const result = document.getElementById("authResult");

    if (!email || !password) {
        result.innerHTML = "Please enter email and password.";
        return;
    }

    const savedUser = localStorage.getItem("finpulseUser");

    if (!savedUser) {
        result.innerHTML =
            "No account found. Please create an account first.";
        return;
    }

    const user = JSON.parse(savedUser);

    if (
        user.email === email &&
        user.password === password
    ) {

        result.innerHTML = `
    <h3>Login Successful! ✅</h3>
    <p>Welcome, ${user.name}!</p>
`;

setTimeout(() => {
    window.location.href = "index.html";
}, 1000);

        localStorage.setItem("loggedIn", "true");

    } else {

        result.innerHTML =
            "Invalid email or password.";
    }
}