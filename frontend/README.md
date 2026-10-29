
# Expense Tracker System

A personal finance management application built with **React** and **Django REST Framework**. It helps users record expenses, monitor spending patterns, filter transactions, and export expense data for further analysis.

## Features

### Expense Management
- Add new expenses with a description, category, amount, and date.
- Edit existing expense records.
- Delete expenses with a confirmation prompt.
- Validate required fields and expense amounts.

### Search and Filtering
- Search expenses by description.
- Filter transactions by category.
- Filter expenses by a start date and end date.
- Combine search and filters.
- Clear all active filters.

### Dashboard and Analytics
- View summary statistics for filtered expenses.
- Visualize spending by category using a doughnut chart.
- Compare monthly spending using a bar chart.
- View expense amounts in Ugandan shillings (UGX).

### Sorting and Pagination
- Sort by newest or oldest expense date.
- Sort by highest or lowest expense amount.
- Sort descriptions alphabetically from A–Z or Z–A.
- Display 10 expenses per page.
- Navigate between pages using Previous and Next controls.

### CSV Export
- Export matching expenses to a downloadable CSV file.
- Open exported data in Microsoft Excel or import it into Google Sheets.
- Include description, category, amount, expense date, and creation timestamp.
- Respect the active search, category, and date filters.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Recharts

**Backend**
- Python
- Django
- Django REST Framework
- SQLite

**Development Tools**
- Visual Studio Code
- Git
- GitHub
- Node.js and npm

## Project Structure

```text
expense-tracker-system/
├── backend/
│   ├── expenses_api/
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── index.html
├── .venv/
├── expenses.db
└── README.md
```

The structure above is illustrative. Your local database and virtual environment should not be committed to GitHub.

## Getting Started

### Prerequisites

Install the following tools:

- Python
- Node.js and npm
- Git

### 1. Clone the repository

```powershell
git clone https://github.com/KawumaLatiif/expense-tracker-system.git
cd expense-tracker-system
```

### 2. Set up the Python environment

If you already have the project virtual environment, activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies using the project's requirements file if one is available:

```powershell
pip install -r requirements.txt
```

If the repository does not yet contain a `requirements.txt`, install the project's required Python packages separately.

### 3. Start the Django backend

```powershell
cd backend
python manage.py migrate
python manage.py runserver
```

The API should be available at:

http://127.0.0.1:8000/api/expenses/

Keep this terminal running.

### 4. Start the React frontend

Open a second terminal in VS Code:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

http://localhost:5173/

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/expenses/` | Retrieve expenses |
| POST | `/api/expenses/` | Create an expense |
| PATCH | `/api/expenses/{id}/` | Update an expense |
| DELETE | `/api/expenses/{id}/` | Delete an expense |
| GET | `/api/expenses/summary/` | Retrieve expense statistics |
| GET | `/api/expenses/monthly_summary/` | Retrieve monthly spending data |

The expenses endpoint supports search, category, and date filters.

Example:

```text
/api/expenses/?category=Food
/api/expenses/?search=lunch
/api/expenses/?start_date=2026-10-01&end_date=2026-10-31
```

## Future Improvements

Potential future enhancements include:

- Monthly budgets and spending alerts.
- User authentication and individual accounts.
- Improved reports and additional export formats.
- Automated testing.
- Deployment to a production hosting platform.

## Project Status

The application currently supports expense CRUD operations, search and filtering, dashboard analytics, sorting, pagination, and CSV export.

This project is being developed incrementally as a practical learning project for React, Python, Django, REST APIs, and full-stack software development.
