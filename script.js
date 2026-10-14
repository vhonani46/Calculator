
// Get the calculator display and button container
const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

// Store the calculation as a string
let expression = "";

// Track whether the previous action produced a result
let justCalculated = false;

// Update the display, showing X instead of * for multiplication
function updateDisplay() {
    display.value = expression.replace(/\*/g, "X") || "0";
}

// Clear the calculator
function clearCalculator() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

// Delete the last entered character
function deleteLastCharacter() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

// Check whether the expression ends with an operator
function endsWithOperator(value) {
    return /[+\-*/]$/.test(value);
}

// Add a number, decimal point, or operator
function appendValue(value) {
    // Start a new expression after a completed calculation
    if (justCalculated) {
        if (/[0-9.]/.test(value)) {
            expression = "";
        }

        justCalculated = false;
    }

    // Allow a minus sign at the start of an expression
    if (/[+\-*/]/.test(value) && expression === "") {
        if (value !== "-") return;
    }

    // Prevent consecutive operators, except a negative number
    if (/[+\-*/]/.test(value) && endsWithOperator(expression)) {
        if (value === "-" && /[*/]$/.test(expression)) {
            expression += value;
        } else {
            expression = expression.slice(0, -1) + value;
        }

        updateDisplay();
        return;
    }

    // Prevent multiple decimal points in one number
    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/]/).pop();

        if (currentNumber.includes(".")) return;

        // Add a zero before a decimal point when necessary
        if (currentNumber === "") {
            expression += "0";
        }
    }

    // Append the selected value to the expression
    expression += value;
    updateDisplay();
}

// Convert the final number into a percentage
function calculatePercentage() {
    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const percentage = Number(match[0]) / 100;

    // Replace the final number with its percentage value
    expression =
        expression.slice(0, -match[0].length) +
        String(percentage);

    justCalculated = false;
    updateDisplay();
}

// Calculate the result of the expression
function calculateResult() {
    if (!expression) return;

    // Reject incomplete expressions
    if (endsWithOperator(expression) || expression.endsWith(".")) {
        display.value = "Invalid expression";
        return;
    }

    try {
        // Only allow numbers and supported arithmetic symbols
        if (!/^[0-9+\-*/.()\s]+$/.test(expression)) {
            throw new Error("Invalid input");
        }

        // Evaluate the validated arithmetic expression
        const result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        // Reject infinite or invalid results, such as division by zero
        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        // Reduce floating-point rounding errors
        const roundedResult = Number(result.toPrecision(12));

        // Store the result for further calculations
        expression = String(roundedResult);
        justCalculated = true;
        updateDisplay();

    } catch (error) {
        // Show an error for an invalid calculation
        display.value = "Error";
        expression = "";
        justCalculated = false;
    }
}

// Handle all calculator button clicks with one event listener
buttons.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    // Ignore clicks outside the buttons
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    // Perform the action associated with the clicked button
    switch (action) {
        case "clear":
            clearCalculator();
            break;

        case "delete":
            deleteLastCharacter();
            break;

        case "percent":
            calculatePercentage();
            break;

        case "calculate":
            calculateResult();
            break;

        default:
            if (value !== undefined) {
                appendValue(value);
            }
    }
});

// Add keyboard support
document.addEventListener("keydown", function(event) {
    const key = event.key;

    // Accept numbers, decimal points, and arithmetic operators
    if (/^[0-9.+\-*/]$/.test(key)) {
        appendValue(key);
    }

    // Calculate when Enter or = is pressed
    else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
    }

    // Delete the last character
    else if (key === "Backspace") {
        deleteLastCharacter();
    }

    // Clear the calculator
    else if (key === "Escape") {
        clearCalculator();
    }

    // Convert the final number to a percentage
    else if (key === "%") {
        calculatePercentage();
    }
});