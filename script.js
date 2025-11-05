let isEditing = false;
let editingId = null;
// ===== Select Elements =====
const transactionForm = document.getElementById("transactionForm");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const transactionList = document.getElementById("transactionList");
const submitBtn = document.getElementById("submit-btn");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const netBalanceEl = document.getElementById("netBalance");

const filterCategory = document.getElementById("filterCategory");
const ctx = document.getElementById("expenseChart").getContext("2d");

// ===== Transactions Array (from localStorage or empty) =====
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// ===== Chart.js Setup =====
let expenseChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Food", "Travel", "Entertainment", "Bills", "Other"],
    datasets: [{
      label: "Expenses by Category",
      data: [0, 0, 0, 0, 0],
      backgroundColor: ["#e67e22", "#3498db", "#9b59b6", "#2ecc71", "#e74c3c"]
    }]
  }
});

// ===== Add / Update Transaction =====
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = document.querySelector('input[name="type"]:checked');

  if (!dateInput.value || !descriptionInput.value || !categoryInput.value || !amountInput.value || !type) {
    alert("⚠ Please fill out all fields!");
    return;
  }

  const transaction = {
    id: isEditing ? editingId : Date.now(),
    date: dateInput.value,
    description: descriptionInput.value,
    category: categoryInput.value,
    amount: parseFloat(amountInput.value),
    type: type.value
  };

  if (isEditing) {
    // Update existing transaction
    transactions = transactions.map(t => t.id === editingId ? transaction : t);
    isEditing = false;
    editingId = null;
    submitBtn.textContent = "Add Transaction";
  } else {
    // Add new transaction
    transactions.push(transaction);
  }

  saveToLocalStorage();
  renderTransactions();
  updateSummary();
  updateChart();

  transactionForm.reset();
});


// ===== Render Transactions =====
function renderTransactions() {
  transactionList.innerHTML = "";

  let filteredTransactions = filterCategory.value === "all"
    ? transactions
    : transactions.filter(t => t.category === filterCategory.value);

  filteredTransactions.forEach((transaction) => {
    const li = document.createElement("li");
    li.classList.add(transaction.type);

    li.innerHTML = `
      <div class="transaction-details">
        <strong>${transaction.description}</strong> <br>
        <small>${transaction.date} | ${transaction.category}</small>
      </div>
      <div>
        <span class="transaction-amount">${transaction.type === "income" ? "+" : "-"} ₹${transaction.amount}</span>
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">✏️</button>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">X</button>
      </div>
    `;

    transactionList.appendChild(li);
  });
}


// ===== Update Summary =====
function updateSummary() {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  });

  const netBalance = totalIncome - totalExpenses;

  totalIncomeEl.textContent = `₹${totalIncome}`;
  totalExpensesEl.textContent = `₹${totalExpenses}`;
  netBalanceEl.textContent = `₹${netBalance}`;
}

// ===== Update Chart =====
function updateChart() {
  let categoryTotals = { Food: 0, Travel: 0, Entertainment: 0, Bills: 0, Other: 0 };

  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryTotals[t.category] += t.amount;
    }
  });

  expenseChart.data.datasets[0].data = [
    categoryTotals.Food,
    categoryTotals.Travel,
    categoryTotals.Entertainment,
    categoryTotals.Bills,
    categoryTotals.Other
  ];

  expenseChart.update();
}

// ===== Delete Transaction =====
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveToLocalStorage();
  renderTransactions();
  updateSummary();
  updateChart();
}

// ===== Edit Transaction =====
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);

  // Load values into form
  dateInput.value = transaction.date;
  descriptionInput.value = transaction.description;
  categoryInput.value = transaction.category;
  amountInput.value = transaction.amount;
  document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;

  // Set editing mode
  isEditing = true;
  editingId = id;
  submitBtn.textContent = "Update Transaction";
}

// ===== Save to Local Storage =====
function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ===== Filter Change Event =====
filterCategory.addEventListener("change", () => {
  renderTransactions();
});

// ===== Initial Render =====
renderTransactions();
updateSummary();
updateChart();
