# Test Cases

This file describes the 17 UI test cases for Automation Playground, independent of any automation framework. The same suite is implemented in two reference implementations:

- Selenium WebDriver (Python): [selenium-python-framework](https://github.com/alex-duta/selenium-python-framework)
- Playwright (Python): [playwright-python-framework](https://github.com/alex-duta/playwright-python-framework)

Both were written for [automation-lab](https://github.com/alex-duta/automation-lab) 1.x. Their `--reset-app-data` option does not work with this repository; empty the data with `POST /reset` instead.

To compare another framework, language or environment with these two, implement the test cases below and follow the rules in [Implementing the suite](#implementing-the-suite).

## Overview

| ID | Test name | Page | What the test exercises |
|---|---|---|---|
| TC01 | `test_create_10_users` | Create User | Bulk creation, loading indicator |
| TC02 | `test_create_user_success` | Create User | Form input, drop-downs, file upload |
| TC03 | `test_create_user_negative` | Create User | Required-field validation |
| TC04 | `test_filter_users_by_name` | List Users | Text filter, asynchronous table update |
| TC05 | `test_filter_users_by_email` | List Users | Text filter, asynchronous table update |
| TC06 | `test_filter_users_by_role` | List Users | Drop-down filter |
| TC07 | `test_filter_users_by_status` | List Users | Drop-down filter |
| TC08 | `test_filter_users_by_name_role_and_status` | List Users | Combined filters |
| TC09 | `test_filter_users_by_non_existing_name` | List Users | Empty result |
| TC10 | `test_pagination` | List Users | Paging without a loading indicator |
| TC11 | `test_reset_filters` | List Users | Resetting filters, table refresh |
| TC12 | `test_overlaping_elements` | User Search Overlap | Element next to an overlapping element in a scrollable area |
| TC13 | `test_alert_accept` | User Dialogs | Browser alert |
| TC14 | `test_confirm_dialog_accept` | User Dialogs | Browser confirmation, accepted |
| TC15 | `test_confirm_dialog_cancel` | User Dialogs | Browser confirmation, cancelled |
| TC16 | `test_prompt_dialog_enter_text_and_accept` | User Dialogs | Browser prompt with text input |
| TC17 | `test_prompt_dialog_cancel` | User Dialogs | Browser prompt, cancelled |

The pages are opened from the dashboard at the application's base URL (by default `http://localhost:3000/`). Their paths are `/create-user`, `/users`, `/user-search-overlap` and `/user-dialogs`.

## Test data

Every value is generated for each test:

| Field | Rule | Example |
|---|---|---|
| Name | Random first name + random last name + 6 random hex characters | `Diana Brown 3fa2c1` |
| Non-existing name | A random UUID | `0b6f…-…` |
| E-mail | `user_` + 8 random hex characters + `@example.com` | `user_9c1d02ab@example.com` |
| Role | One of `Admin`, `Editor`, `Viewer` | |
| Status | One of `Active`, `Disabled` | |
| Profile picture | A small PNG file | |


## Test cases

Every test starts in a new browser at the base URL. "Create a user" means filling in the Create User form (name, e-mail, role, status) and clicking **Create User**. "Create 10 users" means clicking **Create 10 Users**.

### Create User

**TC01 `test_create_10_users`**
1. Open Create User.
2. Click **Create 10 Users** and wait for the request to finish.

Expected: the message `10 users created successfully!` is shown.

**TC02 `test_create_user_success`**
1. Open Create User.
2. Enter a name and e-mail, select a role and status, and upload the profile picture.
3. Click **Create User**.

Expected: the message `User created successfully!` is shown.

**TC03 `test_create_user_negative`**
1. Open Create User.
2. Click **Create User** without filling in the form.

Expected: the message `Name and Email are required.` is shown.

### List Users

TC04 to TC08 and TC11 first run the same preparation, which puts the test's own user among other users:

- open Create User, create 10 users, then create one user with a generated name, e-mail, role and status;
- go back to the dashboard.

After preparation, every test opens List Users and waits until the table has loaded.

**TC04 `test_filter_users_by_name`**
1. Enter the user's name in the search field.

Expected: a table row contains the name.

**TC05 `test_filter_users_by_email`**
1. Enter the user's e-mail in the search field.

Expected: a table row contains the e-mail.

**TC06 `test_filter_users_by_role`**
1. Select the user's role in the role filter.

Expected: a table row contains the role.

**TC07 `test_filter_users_by_status`**
1. Select the user's status in the status filter.

Expected: a table row contains the status.

**TC08 `test_filter_users_by_name_role_and_status`**
1. Enter the user's name.
2. Select the role, then the status.

Wait for the table to update after each step before the next one.

Expected: one table row contains the name, the role and the status.

**TC09 `test_filter_users_by_non_existing_name`** (no preparation)
1. Enter a non-existing name in the search field.

Expected: the "No users found" cell is shown.

**TC10 `test_pagination`** (own preparation: create 10 users twice, so there is more than one page)
1. Read the rows on the first page.
2. Click **Next page** and read the rows again.

Expected: the two pages show different rows.

**TC11 `test_reset_filters`**
1. Filter by the user's name, role and status, and read the rows.
2. Click **Reset Filters** and read the rows again.

Expected: the rows before and after the reset differ.

### User Search Overlap

**TC12 `test_overlaping_elements`**
1. Open User Search Overlap.
2. Scroll to **Get Random User Name**, which sits inside a scrollable area under an overlapping element.
3. Click the button and wait for the request to finish.

Expected: the success message contains `Random user:`.

### User Dialogs

Each dialog fetches the user list after the dialog is closed, and shows the result on the page. Tests that expect a user name create users first.

**TC13 `test_alert_accept`** (preparation: create 10 users)
1. Open User Dialogs and click **Show Alert**.
2. Accept the alert.

Expected: the success message contains `Alert result: Alert was shown, random user:`.

**TC14 `test_confirm_dialog_accept`** (preparation: create 10 users)
1. Open User Dialogs and click **Show Confirm**.
2. Accept the confirmation.

Expected: the success message contains `Confirm result: User clicked OK. Random user name:`.

**TC15 `test_confirm_dialog_cancel`** (preparation: create 10 users)
1. Open User Dialogs and click **Show Confirm**.
2. Cancel the confirmation.

Expected: the error message contains `Confirm result: User cancelled the action.`

**TC16 `test_prompt_dialog_enter_text_and_accept`** (preparation: create one user)
1. Open User Dialogs and click **Show Prompt**.
2. Enter the name of the created user and accept.

Expected: the success message contains `User found in the system.`

**TC17 `test_prompt_dialog_cancel`** (no preparation)
1. Open User Dialogs and click **Show Prompt**.
2. Cancel the prompt.

Expected: the error message contains `Prompt result: Prompt canceled.`

## Implementing the suite

If you write a new implementation, it has to do the following the same way as the two reference implementations. Otherwise, its results cannot be compared with theirs.

- **Browser life cycle:** start a new browser for each test and close it after the test.
- **Browser:** headless, window or viewport 1920 × 1080.
- **Typing:** enter text key by key, not by setting the field value directly.
- **Screenshot:** save one at the end of every test.
- **Timeouts:** 10 s for element interactions, page transitions and the waits below. Do not use an implicit wait.
- **Waits:** poll every 50 ms.
  - Page transition: wait until the URL contains the page path.
  - Table update: wait until no loading indicator is shown and the table has content, then until the table content has not changed for 150 ms.
  - Filter: wait until every row matches all filters applied so far, or the "No users found" cell is shown, then until the table is stable.
  - Paging and filter reset: wait until the rows change. The loading indicator is often too short to observe, and is not shown at all when paging.
- **Application data:** empty the user list before each run of the whole suite, so every run starts from the same state: `POST /reset` empties it and deletes the uploaded profile pictures.
