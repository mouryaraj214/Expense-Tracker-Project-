const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList').getElementsByTagName('tbody')[0];
const totalAmount = document.getElementById('totalAmount');
let editingIndex = null; // Track the index of the row being edited

// Load expenses from local storage and initialize total amount
document.addEventListener('DOMContentLoaded', () => {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.forEach((expense, index) => addExpenseToTable(expense, index));
    updateTotalAmount(expenses);
});

expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    if (description && category && !isNaN(amount) && amount > 0 && date) {
        const expense = { description, category, amount, date };
        if (editingIndex !== null) {
            // Edit existing expense
            updateExpenseInTable(editingIndex, expense);
            updateExpenseInStorage(editingIndex, expense);
        } else {
            // Add new expense
            addExpenseToTable(expense, expenseList.rows.length);
            saveExpense(expense);
        }
        expenseForm.reset();
        editingIndex = null; // Reset the editing index
        updateTotalAmount(); // Update total after addition or edit
    } else {
        alert('Please fill out all fields with valid data');
    }
});

function addExpenseToTable(expense, index) {
    const newRow = expenseList.insertRow(index);

    newRow.innerHTML = `
        <td>${expense.description}</td>
        <td>${expense.category}</td>
        <td>${expense.amount.toFixed(2)}</td>
        <td>${new Date(expense.date).toLocaleDateString()}</td>
        <td>
            <button class="edit" onclick="editExpense(${index})">Edit</button>
            <button onclick="deleteExpense(${index})">Delete</button>
        </td>
    `;
}

function saveExpense(expense) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateTotalAmount(expenses = null) {
    if (expenses === null) {
        expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    }

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmount.textContent = total.toFixed(2);
}

function editExpense(index) {
    const row = expenseList.rows[index];
    const cells = row.getElementsByTagName('td');

    document.getElementById('description').value = cells[0].textContent;
    document.getElementById('category').value = cells[1].textContent;
    document.getElementById('amount').value = parseFloat(cells[2].textContent);
    document.getElementById('date').value = new Date(cells[3].textContent).toISOString().split('T')[0];

    editingIndex = index;
}

function updateExpenseInTable(index, updatedExpense) {
    const row = expenseList.rows[index];
    const cells = row.getElementsByTagName('td');

    cells[0].textContent = updatedExpense.description;
    cells[1].textContent = updatedExpense.category;
    cells[2].textContent = updatedExpense.amount.toFixed(2);
    cells[3].textContent = new Date(updatedExpense.date).toLocaleDateString();
}

function updateExpenseInStorage(index, updatedExpense) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses[index] = updatedExpense;
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateTotalAmount(expenses);
}

function deleteExpense(index) {
    expenseList.deleteRow(index);
    removeExpenseFromStorage(index);
    updateTotalAmount(); // Update total after deletion
}

function removeExpenseFromStorage(index) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function filterExpenses() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    if (startDate && endDate) {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        // Clear the table and add filtered expenses
        expenseList.innerHTML = '';
        filteredExpenses.forEach((expense, index) => addExpenseToTable(expense, index));

        // Update total based on filtered expenses
        updateTotalAmount(filteredExpenses);
    } else {
        alert('Please select both start and end dates');
    }
}
