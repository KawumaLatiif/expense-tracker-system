
/*
 * This file contains all functions that communicate with
 * the Django REST API.
 *
 * Keeping API requests here prevents App.jsx from becoming
 * crowded with networking code.
 */

// Base URL for the Django expenses API.
const API_URL = "http://127.0.0.1:8000/api/expenses/";

/*
 * Convert an unsuccessful HTTP response into a useful error.
 * DELETE requests may return no response body.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();

      // Django REST Framework often returns field-specific errors.
      if (data && typeof data === "object") {
        message = Object.entries(data)
          .map(([field, errors]) => {
            const details = Array.isArray(errors)
              ? errors.join(" ")
              : String(errors);

            return `${field}: ${details}`;
          })
          .join(" ");
      }
    } catch {
      // Keep the original status message if no JSON body exists.
    }

    throw new Error(message);
  }

  // A successful DELETE commonly returns HTTP 204 with no body.
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getExpenses(filters = {}) {
  // Build a URL that can include search and category filters.
  const url = new URL(API_URL);

  // Add the search term only when the user enters one.
  if (filters.search) {
    url.searchParams.set("search", filters.search);
  }

  // Add the category only when a category is selected.
  if (filters.category) {
    url.searchParams.set("category", filters.category);
  }

  // Filter expenses on or after the selected start date.
  if (filters.start_date) {
    url.searchParams.set("start_date", filters.start_date);
  }

  // Filter expenses on or before the selected end date.
  if (filters.end_date) {
    url.searchParams.set("end_date", filters.end_date);
  }

  // Send the request to Django with the selected filters.
  const response = await fetch(url);

  // Return the expenses or handle any API errors.
  return handleResponse(response);
}

// Create a new expense.
export async function createExpense(expense) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  return handleResponse(response);
}

export async function updateExpense(id, expenseData) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      JSON.stringify(errorData) ||
        "Failed to update expense."
    );
  }

  return response.json();
}

// Delete one expense using its database ID.
export async function deleteExpense(id) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

// Retrieve the summary calculated by Django.
export async function getExpenseSummary(filters = {}) {
  const url = new URL(`${API_URL}summary/`);

  // Only send filters that have a value.
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  return handleResponse(response);
}

export async function getMonthlySummary(filters = {}) {
  const url = new URL(`${API_URL}monthly_summary/`);

  // Add the active filters to the request.
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch monthly spending summary.");
  }

  return response.json();
}
