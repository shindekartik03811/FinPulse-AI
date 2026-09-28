const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files
const frontendPath = path.join(__dirname, "../Frontend");
app.use(express.static(frontendPath));

const toNumber = (value, fieldName) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
        throw new Error(`${fieldName} must be a valid non-negative number`);
    }
    return num;
};

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "FinPulse AI Backend is Running!"
    });
});

app.post("/api/loan-eligibility", (req, res) => {
    try {
        const income = toNumber(req.body.income, "income");
        const existingEMI = toNumber(req.body.existingEMI ?? 0, "existingEMI");
        const creditScore = toNumber(req.body.creditScore, "creditScore");
        const loanAmount = toNumber(req.body.loanAmount, "loanAmount");

        if (income <= 0 || creditScore <= 0 || loanAmount <= 0) {
            return res.status(400).json({
                message: "Please provide valid positive values for income, credit score, and loan amount."
            });
        }

        let foir = 50;

        if (creditScore < 750) {
            foir = 45;
        }

        if (creditScore < 650) {
            foir = 35;
        }

        const maximumEMI = (income * foir) / 100;
        const availableEMI = Math.max(0, maximumEMI - existingEMI);

        let interestRate = 11;

        if (creditScore >= 750) {
            interestRate = 8.5;
        } else if (creditScore >= 700) {
            interestRate = 9.5;
        }

        const months = 240;
        const monthlyRate = interestRate / 12 / 100;

        if (monthlyRate === 0) {
            return res.status(400).json({
                message: "Interest rate cannot be zero."
            });
        }

        const eligibleAmount =
            (availableEMI * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;

        let status = "Not Eligible";

        if (eligibleAmount >= loanAmount) {
            status = "Eligible";
        } else if (eligibleAmount > 0) {
            status = "Partially Eligible";
        }

        return res.json({
            status,
            eligibleAmount: Math.round(eligibleAmount),
            interestRate,
            availableEMI: Math.round(availableEMI)
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
});

app.post("/api/emi", (req, res) => {
    try {
        const loan = toNumber(req.body.loan, "loan");
        const rate = toNumber(req.body.rate, "rate");
        const years = toNumber(req.body.years, "years");

        if (loan <= 0 || rate < 0 || years <= 0) {
            return res.status(400).json({
                message: "Please provide valid EMI details."
            });
        }

        const months = years * 12;
        const monthlyRate = rate / 12 / 100;

        if (monthlyRate === 0) {
            return res.status(400).json({
                message: "Interest rate cannot be zero."
            });
        }

        const emi =
            (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);

        const totalPayment = emi * months;
        const totalInterest = totalPayment - loan;

        return res.json({
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment)
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
});

// Fallback to index.html for SPA/frontend routes if file not found
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`FinPulse AI Server running on port ${PORT}`);
});