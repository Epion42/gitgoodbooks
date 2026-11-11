# Feature 1

| Test ID | Feature/Requirement | Acceptance Criterion | Preconditions | Test data | User steps | Expected result | Tester ID | Actual result | Status | Issue/Follow-up |
|---------|---------------------|----------------------|---------------|-----------|------------|-----------------|-----------|---------------|--------|-----------------|
| UAT-01 | Account login | Input fields are easily identifiable. | User is not logged in to any account, and is on the login page. | Valid username with invalid password. | 1) Enter a correct and already-registered user 2) Enter a password that is incorrect and not associated with the username 3) Submit | Login does not grant any access, and a generic error message is served, as to not identify whether or not the username or password was incorrect. | T1 | Application displays a generic error message, sets HTTP status to 401. | Complete | N/A |

# Feature 2

| Test ID | Feature / requirement | Acceptance criterion | Preconditions | Test data | User steps | Expected result | Tester ID | Actual result | Status | Issue / follow-up |
|---|---|---|---|---|---|---|---|---|---|---|
| UAT-R1 | Rate Book / Write Book Review | AC-R1, AC-R2 | Freshly seeded DB; signed in as testUser1; testUser1 has not rated the book | Book `CR23QgAACAAJ`; rating 5; review "A heartbreaking classic." | 1. Go to `/books/CR23QgAACAAJ`. 2. Scroll to "Ratings & reviews". 3. Click "5 ★". 4. Type the review text. 5. Click "Submit rating". | Page reloads at the reviews section. Top of the page shows **3.5 / 5 · 3 ratings**. The first review in the list shows "testUser1", today's date (e.g. "Nov 11, 2026"), ★★★★★ and "A heartbreaking classic." The button now reads "Update rating", with a "Delete my rating" button below it. | Planned: T1, T2 | Not run | Not run | None yet |

# Feature 3

| Test ID | Feature/Requirement | Acceptance Criterion | Preconditions | Test data | User steps | Expected result | Tester ID | Actual result | Status | Issue/Follow-up |
|---------|---------------------|----------------------|---------------|-----------|------------|-----------------|-----------|---------------|--------|-----------------|
| UAT-02 | Navigation Bar | The Navbar correctly displays and redirects to relevant pages | Show either Account dropdown and Logout button when logged in OR Register and Login button when logged out | Be on website when logged in or logged out. Use each Navigation. | Press each button, attempt to search | Correctly redirects user to the specified page | Planned: T1 | Redirects correctly to specified pages | Complete | N/A |
