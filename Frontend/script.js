const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? (window.location.port === "5000" ? "" : "http://localhost:5000")
    : (window.location.hostname.endsWith("onrender.com") ? "" : "https://finpulse-ai-a9ov.onrender.com");

const isLoggedIn = localStorage.getItem("loggedIn") === "true";

if (!isLoggedIn) {
    window.location.href = "auth.html";
} else {
    try {
        const savedUserStr = localStorage.getItem("loggedInUser");
        if (savedUserStr) {
            const userObj = JSON.parse(savedUserStr);
            const greetingEl = document.getElementById("userGreeting");
            if (greetingEl && userObj?.name) {
                greetingEl.textContent = `👋 Hi, ${userObj.name}`;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function checkLoan() {
    const income = Number(document.getElementById("income").value);
    const existingEMI = Number(document.getElementById("existingEMI").value) || 0;
    const creditScore = Number(document.getElementById("creditScore").value);
    const loanAmount = Number(document.getElementById("loanAmount").value);
    const resultDiv = document.getElementById("loanResult");

    if (!income || !creditScore || !loanAmount) {
        resultDiv.innerHTML = "<p style='color:#ff4d6d;'>Please fill all required details (Income, Credit Score, Desired Loan).</p>";
        return;
    }

    resultDiv.innerHTML = "<p>Analyzing your eligibility with FinPulse AI...</p>";

    try {
        const response = await fetch(
            API_URL + "/api/loan-eligibility",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    income: income,
                    existingEMI: existingEMI,
                    creditScore: creditScore,
                    loanAmount: loanAmount
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            resultDiv.innerHTML = `<p style='color:#ff4d6d;'>${data.message || "An error occurred."}</p>`;
            return;
        }

        const statusColor = data.status === "Eligible" ? "#10b981" : (data.status === "Partially Eligible" ? "#f59e0b" : "#ef4444");

        resultDiv.innerHTML = `
            <h3 style="color:${statusColor};">${data.status}</h3>
            <p><strong>Estimated Eligible Amount:</strong> ₹${data.eligibleAmount.toLocaleString("en-IN")}</p>
            <p><strong>Estimated Interest Rate:</strong> ${data.interestRate}%</p>
            <p><strong>Max Available EMI:</strong> ₹${data.availableEMI.toLocaleString("en-IN")}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = "<p style='color:#ff4d6d;'>Backend connection failed. Please ensure the server is active.</p>";
        console.error("Loan Eligibility Error:", error);
    }
}

// Credit Score Analyzer
function analyzeCredit() {
    const score = Number(document.getElementById("scoreInput").value);
    const result = document.getElementById("creditResult");

    if (!score || score < 300 || score > 900) {
        result.innerHTML = "<p style='color:#ff4d6d;'>Please enter a valid credit score between 300 and 900.</p>";
        return;
    }

    let status = "";
    let color = "";
    let advice = "";

    if (score >= 750) {
        status = "Excellent Credit Score ⭐";
        color = "#10b981";
        advice = "High chance of quick loan approval with the most competitive interest rates.";
    } else if (score >= 700) {
        status = "Good Credit Score 👍";
        color = "#38bdf8";
        advice = "Good approval probability. Keep paying credit bills on time to reach excellent.";
    } else if (score >= 650) {
        status = "Fair Credit Score ⚠️";
        color = "#f59e0b";
        advice = "Moderate approval chance. Work on keeping credit card utilization under 30%.";
    } else {
        status = "Poor Credit Score ❌";
        color = "#ef4444";
        advice = "High risk of loan rejection or higher rates. Focus on settling overdue payments.";
    }

    result.innerHTML = `
        <h3 style="color:${color};">${status}</h3>
        <p><strong>Your Credit Score:</strong> ${score}</p>
        <p>${advice}</p>
    `;
}

// EMI Calculator
async function calculateEMI() {
    const loan = Number(document.getElementById("emiLoan").value);
    const rate = Number(document.getElementById("emiRate").value);
    const years = Number(document.getElementById("emiYears").value);
    const result = document.getElementById("emiResult");

    if (!loan || !rate || !years) {
        result.innerHTML = "<p style='color:#ff4d6d;'>Please fill all EMI details (Loan Amount, Interest Rate, Tenure).</p>";
        return;
    }

    result.innerHTML = "<p>Calculating EMI...</p>";

    try {
        const response = await fetch(
            API_URL + "/api/emi",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    loan: loan,
                    rate: rate,
                    years: years
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            result.innerHTML = `<p style='color:#ff4d6d;'>${data.message || "Calculation failed."}</p>`;
            return;
        }

        result.innerHTML = `
            <h3>Monthly EMI: ₹${data.emi.toLocaleString("en-IN")}</h3>
            <p><strong>Total Interest:</strong> ₹${data.totalInterest.toLocaleString("en-IN")}</p>
            <p><strong>Total Payment (Principal + Interest):</strong> ₹${data.totalPayment.toLocaleString("en-IN")}</p>
        `;
    } catch (error) {
        result.innerHTML = "<p style='color:#ff4d6d;'>Backend connection failed. Please check the server.</p>";
        console.error("EMI Calculator Error:", error);
    }
}

// AI Financial Tips
function showTips() {
    const result = document.getElementById("tipsResult");

    const income = Number(document.getElementById("income")?.value) || 0;
    const existingEMI = Number(document.getElementById("existingEMI")?.value) || 0;
    const creditScore = Number(document.getElementById("creditScore")?.value || document.getElementById("scoreInput")?.value) || 0;

    let tips = [];

    if (creditScore > 0) {
        if (creditScore < 650) {
            tips.push("Work on improving your credit score by paying EMIs and credit card bills before the due date.");
        } else if (creditScore < 750) {
            tips.push("Your credit score can be improved. Aim to maintain credit utilization below 30%.");
        } else {
            tips.push("Your credit score is strong (750+), qualifying you for lower interest rates.");
        }
    }

    if (income > 0) {
        const emiRatio = (existingEMI / income) * 100;

        if (emiRatio > 40) {
            tips.push(`Your existing EMI is ${emiRatio.toFixed(1)}% of your monthly income. Avoid taking unnecessary debt.`);
        } else if (existingEMI > 0) {
            tips.push(`Your debt-to-income ratio is healthy (${emiRatio.toFixed(1)}%), preserving good loan eligibility.`);
        }
    }

    if (income === 0 && creditScore === 0) {
        tips.push("Enter your financial details in the Loan Eligibility or Credit Score section to receive tailored tips.");
    }

    tips.push("Compare interest rates and processing fees across multiple institutions before finalizing a loan.");
    tips.push("Maintain an emergency fund covering 3-6 months of living expenses.");

    result.innerHTML = `
        <h3>Personalized Financial Tips 🤖</h3>
        ${tips.map(tip => `<p>• ${tip}</p>`).join("")}
    `;
}

// Logout
function logoutUser() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "auth.html";
}