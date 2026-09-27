async function checkLoan() {

    const income = Number(document.getElementById("income").value);
    const existingEMI = Number(document.getElementById("existingEMI").value);
    const creditScore = Number(document.getElementById("creditScore").value);
    const loanAmount = Number(document.getElementById("loanAmount").value);

    if (!income || !creditScore || !loanAmount) {
        document.getElementById("loanResult").innerHTML =
            "Please fill all required details.";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/loan-eligibility",
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
            document.getElementById("loanResult").innerHTML =
                data.message;
            return;
        }

        document.getElementById("loanResult").innerHTML = `
            <h3>${data.status}</h3>

            <p>
                Estimated Eligible Amount:
                ₹${data.eligibleAmount.toLocaleString("en-IN")}
            </p>

            <p>
                Estimated Interest Rate:
                ${data.interestRate}%
            </p>

            <p>
                Available EMI:
                ₹${data.availableEMI.toLocaleString("en-IN")}
            </p>
        `;

    } catch (error) {

        document.getElementById("loanResult").innerHTML =
            "Backend connection failed. Please check if the server is running.";

        console.error(error);
    }
}


// Credit Score Analyzer
function analyzeCredit() {

    const score = Number(
        document.getElementById("scoreInput").value
    );

    const result = document.getElementById("creditResult");

    if (!score) {
        result.innerHTML = "Please enter your credit score.";
        return;
    }

    let message;

    if (score >= 750) {
        message = "Excellent Credit Score 👍";
    } else if (score >= 700) {
        message = "Good Credit Score";
    } else if (score >= 650) {
        message = "Fair Credit Score";
    } else {
        message = "Low Credit Score";
    }

    result.innerHTML = `
        <h3>${message}</h3>
        <p>Your Credit Score: ${score}</p>
    `;
}
async function calculateEMI() {

    const loan = Number(document.getElementById("emiLoan").value);
    const rate = Number(document.getElementById("emiRate").value);
    const years = Number(document.getElementById("emiYears").value);

    const result = document.getElementById("emiResult");

    if (!loan || !rate || !years) {
        result.innerHTML = "Please fill all details.";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/emi",
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
            result.innerHTML = data.message;
            return;
        }

        result.innerHTML = `
            <h3>
                Monthly EMI:
                ₹${data.emi.toLocaleString("en-IN")}
            </h3>

            <p>
                Total Interest:
                ₹${data.totalInterest.toLocaleString("en-IN")}
            </p>

            <p>
                Total Payment:
                ₹${data.totalPayment.toLocaleString("en-IN")}
            </p>
        `;

    } catch (error) {

        result.innerHTML =
            "Backend connection failed. Please check the server.";

        console.error(error);
    }
}
// AI Financial Tips
function showTips() {

    const result = document.getElementById("tipsResult");

    const income = Number(document.getElementById("income").value);
    const existingEMI = Number(document.getElementById("existingEMI").value);
    const creditScore = Number(document.getElementById("scoreInput").value);

    let tips = [];

    if (creditScore && creditScore < 650) {
        tips.push("Work on improving your credit score by paying EMIs and bills on time.");
    } 
    else if (creditScore && creditScore < 750) {
        tips.push("Your credit score can be improved. Maintain timely payments.");
    } 
    else if (creditScore >= 750) {
        tips.push("Your credit score is strong. Continue maintaining timely payments.");
    }

    if (income && existingEMI) {

        const emiRatio = (existingEMI / income) * 100;

        if (emiRatio > 40) {
            tips.push("Your existing EMI is relatively high compared with your income. Avoid taking unnecessary additional debt.");
        } else {
            tips.push("Your existing EMI appears manageable compared with your income.");
        }
    }

    if (!income && !creditScore) {
        tips.push("Enter your financial details to receive personalized tips.");
    }

    tips.push("Compare interest rates and loan terms before choosing a loan.");
    tips.push("Keep an emergency fund for unexpected expenses.");

    result.innerHTML = `
        <h3>Personalized Financial Tips 🤖</h3>
        ${tips.map(tip => `<p>• ${tip}</p>`).join("")}
    `;
}