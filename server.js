const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve Frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// Loan Eligibility
app.post("/api/loan-eligibility", (req, res) => {

    const {
        income,
        existingEMI,
        creditScore,
        loanAmount
    } = req.body;

    if (!income || !creditScore || !loanAmount) {
        return res.status(400).json({
            message: "Please provide all required details."
        });
    }

    let foir = 50;

    if (creditScore < 750) {
        foir = 45;
    }

    if (creditScore < 650) {
        foir = 35;
    }

    const maximumEMI = income * foir / 100;

    const availableEMI =
        Math.max(0, maximumEMI - (existingEMI || 0));

    let interestRate = 11;

    if (creditScore >= 750) {
        interestRate = 8.5;
    } else if (creditScore >= 700) {
        interestRate = 9.5;
    }

    const months = 240;

    const monthlyRate = interestRate / 12 / 100;

    const eligibleAmount =
        availableEMI *
        (1 - Math.pow(1 + monthlyRate, -months))
        / monthlyRate;

    let status = "Not Eligible";

    if (eligibleAmount >= loanAmount) {
        status = "Eligible";
    } else if (eligibleAmount > 0) {
        status = "Partially Eligible";
    }

    res.json({
        status,
        eligibleAmount: Math.round(eligibleAmount),
        interestRate,
        availableEMI: Math.round(availableEMI)
    });
});

// EMI Calculator
app.post("/api/emi", (req, res) => {

    const { loan, rate, years } = req.body;

    if (!loan || !rate || !years) {
        return res.status(400).json({
            message: "Please provide all EMI details."
        });
    }

    const months = years * 12;
    const monthlyRate = rate / 12 / 100;

    const emi =
        loan *
        monthlyRate *
        Math.pow(1 + monthlyRate, months) /
        (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - loan;

    res.json({
        emi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment)
    });
});

// Render PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinPulse AI running on port ${PORT}`);
});