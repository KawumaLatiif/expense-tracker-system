
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

// Retrieve all expenses from Django.
export async function getExpenses() {
  const response = await fetch(API_URL);
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
