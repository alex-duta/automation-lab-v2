# Test Cases

This file describes the UI test cases for Automation Playground, independent of any automation framework.

TC01 to TC17 are the 17 cases of [automation-lab](https://github.com/alex-duta/automation-lab) 1.x. The same 17 cases are implemented in two reference implementations:

- Selenium WebDriver (Python): [selenium-python-framework](https://github.com/alex-duta/selenium-python-framework)
- Playwright (Python): [playwright-python-framework](https://github.com/alex-duta/playwright-python-framework)

Both were written for [automation-lab](https://github.com/alex-duta/automation-lab) 1.x. Their `--reset-app-data` option does not work with this repository; empty the data with `POST /reset` instead.

TC18 onwards test the widgets added in this repository: Edit User, Team Board, Export & Reports, and Session & Preferences. The API test cases and the cases that mix web and API steps are in [API_TEST_CASES.md](API_TEST_CASES.md).

To compare another framework, language or environment with the reference implementations, implement the test cases below and follow the rules in [Implementing the suite](#implementing-the-suite).

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
| TC18 | `test_load_user_with_enter` | Edit User | Enter submits a form, the URL after a search |
| TC19 | `test_save_permissions_and_notifications` | Edit User | Check boxes and radio buttons, checked and unchecked, kept after a reload |
| TC20 | `test_sms_requires_phone` | Edit User | An attribute set by the page, browser form validation, Enter in a field |
| TC21 | `test_language_value_and_text` | Edit User | The value and the visible text of the selected option |
| TC22 | `test_bio_in_rich_text_editor` | Edit User | An editable element inside an iframe, keys with a modifier |
| TC23 | `test_unknown_user` | Edit User | An error message |
| TC24 | `test_add_user_to_team` | Team Board | A form with a drop-down, a card added to a lane |
| TC25 | `test_drag_card_to_another_team` | Team Board | HTML5 drag and drop |
| TC26 | `test_card_details_on_hover` | Team Board | Content shown on hover, inside a shadow root |
| TC27 | `test_rename_team_with_double_click` | Team Board | Double click, Escape and Enter in a field |
| TC28 | `test_highlight_card_with_context_menu` | Team Board | Right click, a menu of the page, browser storage read with a script |
| TC29 | `test_remove_user_with_x` | Team Board | A button inside a web component (slot) |
| TC30 | `test_export_users_csv` | Export & Reports | File download |
| TC31 | `test_report_status_changes` | Export & Reports | Waiting for a text and an attribute that change over time |
| TC32 | `test_printable_view_in_new_tab` | Export & Reports | A link that opens a new tab, the title and URL of the tab, closing it |
| TC33 | `test_sign_in_and_out` | Session & Preferences | An HTTP-only cookie set by the server |
| TC34 | `test_disabled_user_cannot_sign_in` | Session & Preferences | An error message, no cookie |
| TC35 | `test_preferences_follow_the_user` | Session & Preferences | Data of the signed-in user, an attribute of the page, reload |
| TC36 | `test_remember_email` | Session & Preferences | A cookie set by the page, deleting cookies |
| TC37 | `test_tabs_in_browser_history` | Session & Preferences | Back and forward between entries of the same page |

The pages are opened from the dashboard at the application's base URL (by default `http://localhost:3000/`). Their paths are `/create-user`, `/users`, `/user-search-overlap`, `/user-dialogs`, `/edit-user`, `/team-board`, `/user-reports` and `/account`.

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
| Non-existing e-mail | A random UUID + `@example.com` | `0b6f…-…@example.com` |
| Name prefix | 8 random hex characters, put before the name of every user of a test (TC30 to TC32) | `5be0c2d4 Diana Brown 3fa2c1` |
| Phone | Always the same | `+40 712 345 678` |
| Bio | `New bio ` + 6 random hex characters | `New bio 7d3e10` |
| Team name | `Platform ` + 6 random hex characters | `Platform 0a91fe` |

Through the API (TC18 onwards), the role and the status are sent in lower case (`admin`, `active`), as the frontend sends them.


## Test cases

Every test starts in a new browser at the base URL. "Create a user" means filling in the Create User form (name, e-mail, role, status) and clicking **Create User**. "Create 10 users" means clicking **Create 10 Users**.

From TC18 on, the preparation runs through the API, not through the pages: each case tests one widget, and its data does not depend on the other pages. "Create a user through the API" means sending `POST /users` with a generated name, e-mail, role and status. The other endpoints are described in [API_TEST_CASES.md](API_TEST_CASES.md). "Open Edit User" (and the other widgets) means clicking the card of the widget on the dashboard.

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

### Edit User

Every case creates a user through the API. "Load the user" means opening Edit User, entering the user's e-mail in the lookup field, pressing Enter and waiting until the line `<name> (<e-mail>)` is shown above the profile form.

**TC18 `test_load_user_with_enter`**
1. Open Edit User.
2. Enter the user's e-mail in the lookup field and press Enter.

Expected: the line `<name> (<e-mail>)` is shown; the URL contains `/edit-user?email=`; no permission is checked, **E-mail** notifications are selected and the language is `English` (the default profile).

**TC19 `test_save_permissions_and_notifications`**
1. Load the user.
2. Check **Create users**, **Edit users** and **Export reports**, then uncheck **Edit users**.
3. Select **None** notifications and click **Save Profile**.
4. Reload the page and wait until the user is loaded again.

Expected: step 3 shows `Profile saved successfully!`; after the reload **Create users** and **Export reports** are checked, **Edit users** and **Delete users** are not, and **None** is selected.

**TC20 `test_sms_requires_phone`**
1. Load the user.
2. Select **SMS** notifications and click **Save Profile** with an empty phone.
3. Enter the phone in the phone field and press Enter in it.

Expected: after step 2 the phone field has the attribute `required`, its validation message (the property `validationMessage`) is not empty, and no message is shown: the browser did not send the form. Step 3 shows `Profile saved successfully!`.

**TC21 `test_language_value_and_text`**
1. Load the user.
2. Select `Romanian` in the language list and click **Save Profile**.
3. Reload the page and wait until the user is loaded again.

Expected: the selected option of the language list shows the text `Romanian`, and the value of the list is `ro`.

**TC22 `test_bio_in_rich_text_editor`** (preparation: the profile of the user has the bio `<p>Old bio</p>`, saved with `PUT /users/{user_id}/profile`)
1. Load the user.
2. In the bio editor, an iframe whose body is the editable element, select all with Control+A and delete with Backspace.
3. Type the generated bio and click **Save Profile**.
4. Reload the page and wait until the user is loaded again.

Expected: step 3 shows `Profile saved successfully!`; after the reload the text of the editor is the generated bio, without `Old bio`.

**TC23 `test_unknown_user`** (no user is created)
1. Open Edit User, enter a non-existing e-mail in the lookup field and click **Load**.

Expected: the error message `User not found.` is shown, and no profile form is shown.

### Team Board

The board has one lane per team. The default teams are `Payments`, `Growth` and `Platform`, with the ids 1, 2 and 3 after `POST /reset`; a case reads their current names with `GET /teams`. A user's card is a web component with an open shadow root, inside the lane of the user's team. Every case creates its users through the API, and puts them in a team with `PUT /users/{user_id}/team` when the case says so.

**TC24 `test_add_user_to_team`**
1. Open Team Board.
2. Enter the user's e-mail, select the name of team 1 in the team list and click **Add to Team**.

Expected: the message `<name> added to <team 1>.` is shown, and the user's card is in the lane of team 1.

**TC25 `test_drag_card_to_another_team`** (preparation: the user is in team 1)
1. Open Team Board.
2. Drag the user's card and drop it on the lane of team 2.
3. Reload the page.

Expected: step 2 shows `<name> moved to <team 2>.`; after step 2 and after the reload the card is in the lane of team 2 and not in the lane of team 1. The page uses the drag and drop of HTML5 (`draggable`, the events `dragstart` and `drop`).

**TC26 `test_card_details_on_hover`** (preparation: the user is in team 1)
1. Open Team Board and read whether the details of the user's card are visible.
2. Move the mouse over the card.

Expected: before step 2 the details are not visible; after it they are, and they show the user's e-mail and `Role: <role>`. The details are inside the shadow root of the card.

**TC27 `test_rename_team_with_double_click`** (no user is created)
1. Open Team Board and read the name of team 3 on its lane.
2. Double-click the name, type the generated team name in the field that appears, and press Escape.
3. Double-click the name again, select all with Control+A, type the generated team name and press Enter.
4. Rename team 3 back to the name of step 1, with `PUT /teams/3`.

Expected: after step 2 the lane shows the name of step 1; step 3 shows `Team renamed to <generated team name>.` and the lane shows the new name. Step 4 runs even when the test fails, so that the other cases find team 3 as it was.

**TC28 `test_highlight_card_with_context_menu`** (preparation: the user is in team 1)
1. Open Team Board and right-click the user's card.
2. Click **Highlight** in the menu that opens.
3. Read the browser storage of the page with a script: `localStorage.getItem("teamBoard.highlighted")`, a JSON list of user ids.
4. Reload the page.

Expected: after step 2 the card has the attribute `highlighted`; the list of step 3 contains the user's id; after the reload the card still has the attribute.

**TC29 `test_remove_user_with_x`** (preparation: the user is in team 1)
1. Open Team Board.
2. Click the **×** of the user's card (its accessible name is `Remove <name> from the team`).
3. Reload the page.

Expected: step 2 shows `<name> removed from the team.`; after step 2 and after the reload the card is not on the board.

### Export & Reports

TC30 to TC32 create three users through the API, whose names begin with the same generated prefix: two with the role `admin` and the status `active`, and one with the role `viewer` and the status `disabled`.

**TC30 `test_export_users_csv`**
1. Open Export & Reports.
2. Enter the prefix in the export search field and select `Admin` in the role list.
3. Click **Export CSV** and read the downloaded file.

Expected: the file is named `users.csv`; its first line is `id,name,email,role,status,created_at`, followed by two lines, with the e-mails of the two admin users; the page is still at `/user-reports`.

**TC31 `test_report_status_changes`**
1. Open Export & Reports.
2. Select `Users by role`, enter the prefix in the report search field and set the processing time to 3 seconds.
3. Click **Generate Report**.
4. Wait until the status contains `Running`.
5. Wait until the attribute `data-status` of the status is `ready`.

Expected: right after step 3 the status is not `Ready`; after step 5 the status is `Ready` and the line `Users counted: 3` is shown.

**TC32 `test_printable_view_in_new_tab`**
1. Open Export & Reports, select `Users by status`, enter the prefix, set the processing time to 0 and click **Generate Report**.
2. Wait until the status is `Ready`, and read the id of the report (the attribute `data-report-id` of the report box).
3. Click **Open printable view**, which opens a new tab, and switch to it.
4. Close the tab.

Expected: in step 3 the title of the tab is `Automation Playground - Report <id>`, its URL contains `/user-reports/print/<id>`, the heading is `Users by status`, the table has the rows `active 2` and `disabled 1`, and the total is `3`. After step 4 the first tab is the current one again, with the title `Automation Playground - Export & Reports`.

### Session & Preferences

The page has two tabs, **Session** and **Preferences**; each tab adds an entry to the browser history (`/account?tab=session`, `/account?tab=preferences`). "Sign in as a user" means entering the user's e-mail on the Session tab and pressing Enter, then waiting for `Signed in as <name> (<e-mail>)`. Every case creates its users through the API, with the status `active` unless the case says otherwise.

**TC33 `test_sign_in_and_out`**
1. Open Session & Preferences.
2. Sign in as the user.
3. Click **Sign Out**.

Expected: before step 2 the page shows `Not signed in`. After step 2 it shows `Signed in as <name> (<e-mail>)`; the browser has the cookie `session_id`, and the page cannot read it, because it is HTTP-only: `document.cookie`, read with a script, does not contain `session_id`. After step 3 the page shows `Not signed in`, and the cookie `session_id` is gone.

**TC34 `test_disabled_user_cannot_sign_in`** (the user has the status `disabled`)
1. Open Session & Preferences and try to sign in as the user.

Expected: the error message `Error: User is disabled` is shown; the page still shows `Not signed in`, and there is no cookie `session_id`.

**TC35 `test_preferences_follow_the_user`** (two users, A and B)
1. Open Session & Preferences, sign in as A, open the Preferences tab, select `Dark` and the date format `22.10.2026`, and click **Save Preferences**.
2. Reload the page.
3. Open the Session tab, click **Sign Out**, and sign in as B.
4. Click **Sign Out** and sign in as A again.

Expected: step 1 shows `Preferences saved.`, and the attribute `data-theme` of the page is `dark`. After the reload of step 2, A is still signed in and `data-theme` is `dark`. After step 3, `data-theme` is `light` (B has the default preferences). After step 4, `data-theme` is `dark` again, and the sign-in time is shown in the format `DD.MM.YYYY HH:MM`.

**TC36 `test_remember_email`**
1. Open Session & Preferences, check **Remember my e-mail on this browser** and sign in as the user.
2. Click **Sign Out**.
3. Delete all cookies of the browser and reload the page.

Expected: after step 1 the browser has the cookie `rememberedEmail`, whose value is the user's e-mail. After step 2 the e-mail field contains the e-mail. After step 3 the page shows `Not signed in` and the e-mail field is empty.

**TC37 `test_tabs_in_browser_history`** (no user is created)
1. Open Session & Preferences from the dashboard.
2. Click the **Preferences** tab.
3. Go back in the browser history, then forward.
4. Go back twice.

Expected: after step 1 the title is `Automation Playground - Session`; after step 2 the URL contains `/account?tab=preferences` and the title is `Automation Playground - Preferences`; after going back the URL ends with `/account` and the title is `Automation Playground - Session`, and after going forward the Preferences tab is shown again; after step 4 the dashboard is shown, with the title `Automation Playground`. The tabs change the history of the same page (`history.pushState`), without loading a new document.

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
  - Action with a message (TC18 onwards): wait until the message is shown.
  - Report (TC31, TC32): wait until the attribute `data-status` of the status is `ready`.
- **Application data:** empty the user list before each run of the whole suite, so every run starts from the same state: `POST /reset` empties it and deletes the uploaded profile pictures.

From TC18 on, also:

- **Preparation:** through the API, as the cases describe. The names of the teams come from `GET /teams`.
- **Independent cases:** no expected value depends on the data of other tests (the number of all users, the members of a whole lane), so the cases can run in parallel. Only TC27 changes data that other cases read (the name of team 3), and it puts it back.
- **Downloads:** the browser saves files without asking; the test reads the name and the content of the downloaded file.
- **Windows:** after a test closes a tab that it opened, it continues in the first tab.
- **Cookies:** every test starts with no cookies, in a new browser.
