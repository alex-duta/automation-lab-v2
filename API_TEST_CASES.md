# API Test Cases

This file describes the API test cases for the backend of Automation Playground, independent of any HTTP library,
and the hybrid cases, which mix web and API steps in the same test. They complement the UI test cases of
[TEST_CASES.md](TEST_CASES.md).

The backend runs at `http://localhost:8000` and is documented at `/docs`. The cases use these endpoints:

| Endpoint | Widget |
|---|---|
| `POST /users`, `GET /users`, `POST /users/{user_id}/upload-picture` | Create User, List Users |
| `GET /users/{user_id}/profile`, `PUT /users/{user_id}/profile` | Edit User |
| `GET /teams`, `PUT /teams/{team_id}`, `PUT /users/{user_id}/team`, `DELETE /users/{user_id}/team` | Team Board |
| `GET /users/export.csv`, `POST /reports`, `GET /reports/{report_id}` | Export & Reports |
| `POST /session`, `GET /session`, `PUT /session/preferences`, `DELETE /session` | Session & Preferences |

## Overview

| ID | Test name | Endpoint | What the test exercises |
|---|---|---|---|
| TA01 | `test_create_user` | `POST /users` | Creating a user |
| TA02 | `test_create_user_duplicate_email` | `POST /users` | 400 for an e-mail that already exists |
| TA03 | `test_create_user_invalid_email` | `POST /users` | 422 for an invalid e-mail |
| TA04 | `test_create_user_missing_name` | `POST /users` | 422 for a missing field |
| TA05 | `test_list_users_search` | `GET /users` | Search by name |
| TA06 | `test_list_users_filters` | `GET /users` | Search, role and status together, and a filter that excludes the user |
| TA07 | `test_list_users_pagination` | `GET /users` | Pages of a given size |
| TA08 | `test_list_users_invalid_page` | `GET /users` | 422 for a page that is not a number |
| TA09 | `test_upload_picture` | `POST /users/{user_id}/upload-picture` | Uploading a profile picture |
| TA10 | `test_upload_picture_unknown_user` | `POST /users/{user_id}/upload-picture` | 404 for a user that does not exist |
| TA11 | `test_unknown_endpoint` | `GET /unknown` | 404 for an endpoint that does not exist |
| TA12 | `test_get_default_profile` | `GET /users/{user_id}/profile` | The default profile of a new user |
| TA13 | `test_save_profile` | `PUT /users/{user_id}/profile` | Saving a profile; permissions in a fixed order, without duplicates |
| TA14 | `test_save_invalid_profile` | `PUT /users/{user_id}/profile` | 422 for SMS without a phone, a wrong phone and an unknown permission |
| TA15 | `test_profile_unknown_user` | `GET`, `PUT /users/{user_id}/profile` | 404 for a user that does not exist |
| TA16 | `test_move_user_between_teams` | `PUT /users/{user_id}/team`, `GET /teams` | A user is in at most one team, the last one it joined |
| TA17 | `test_remove_user_from_team` | `DELETE /users/{user_id}/team` | Removing a user, twice |
| TA18 | `test_team_errors` | `PUT /teams/{team_id}`, `PUT /users/{user_id}/team` | 400 for a name another team has, 422 for a blank name, 404 for an unknown team or user |
| TA19 | `test_export_csv` | `GET /users/export.csv` | A CSV file to download, with the filtered users |
| TA20 | `test_report_becomes_ready` | `POST /reports`, `GET /reports/{report_id}` | A status that changes over time; the result once ready |
| TA21 | `test_report_errors` | `POST /reports`, `GET /reports/{report_id}` | 422 for an unknown type or a delay over 10 s, 404 for an unknown report |
| TA22 | `test_sign_in` | `POST /session`, `GET /session` | An HTTP-only session cookie, sent back in a `Cookie` header |
| TA23 | `test_sign_in_errors` | `POST /session`, `GET /session` | 404, 403, 422 when signing in, 401 without a cookie |
| TA24 | `test_preferences_per_user` | `PUT /session/preferences`, `GET /session` | The preferences of the user of each cookie; 401 for an invalid cookie |
| TA25 | `test_sign_out` | `DELETE /session` | The cookie deleted, the session ended |

## Test data

As for the UI cases, every value is generated for each test (name, e-mail, role, status). The role and the status
are sent in lower case (`admin`, `active`), as the frontend sends them. The profile picture is the PNG of the UI
cases. The phone is `+40 712 345 678`. The ids and the names of the teams come from `GET /teams`; after
`POST /reset` the teams are `Payments`, `Growth` and `Platform`, with the ids 1, 2 and 3.

## Test cases

"Create a user" means sending `POST /users` with a generated name, e-mail, role and status. "Create three users with
a prefix" means creating three users whose names begin with the same generated prefix (8 random hex characters):
two with the role `admin` and the status `active`, and one with the role `viewer` and the status `disabled`.

### Create User

**TA01 `test_create_user`**
1. Create a user.

Expected: the status is 200; the response has an `id`, the name, e-mail, role and status that were sent, no
profile picture, and a creation time.

**TA02 `test_create_user_duplicate_email`**
1. Create a user.
2. Create another user with the same e-mail.

Expected: the status of step 2 is 400, with the detail `Email already exists`.

**TA03 `test_create_user_invalid_email`**
1. Send `POST /users` with the e-mail `not-an-email`.

Expected: the status is 422, and the validation error names the field `email`.

**TA04 `test_create_user_missing_name`**
1. Send `POST /users` without a name.

Expected: the status is 422, and the validation error names the field `name`.

### List Users

**TA05 `test_list_users_search`**
1. Create a user.
2. Send `GET /users?search=<name of the user>`.

Expected: the status is 200; `total` is 1 and the only item has the e-mail of the user.

**TA06 `test_list_users_filters`**
1. Create a user.
2. Send `GET /users` with the search, the role and the status of the user.
3. Send `GET /users` with the search of the user and another role.

Expected: step 2 finds the user (`total` 1); step 3 finds nobody (`total` 0, no items).

**TA07 `test_list_users_pagination`**
1. Create three users whose names begin with the same generated prefix.
2. Send `GET /users?search=<prefix>&size=2&page=1`, then the same with `page=2`.

Expected: `total` is 3 on both pages; page 1 has 2 items, page 2 has 1 item, and no item is on both pages.

**TA08 `test_list_users_invalid_page`**
1. Send `GET /users?page=abc`.

Expected: the status is 422.

### Upload Picture

**TA09 `test_upload_picture`**
1. Create a user.
2. Upload the profile picture for the user, as multipart data in the field `file`.
3. Search the user.

Expected: step 2 returns 200 with the message `Picture uploaded`; in step 3 the user has a profile picture.

**TA10 `test_upload_picture_unknown_user`**
1. Upload the profile picture for a user id that does not exist (a generated UUID).

Expected: the status is 404, with the detail `User not found`.

### Other

**TA11 `test_unknown_endpoint`**
1. Send `GET /unknown`.

Expected: the status is 404. A response is returned for any status; no error is raised (rule of the API contract).

### Edit User

**TA12 `test_get_default_profile`**
1. Create a user.
2. Send `GET /users/{user_id}/profile`.

Expected: the status is 200; `permissions` is an empty list, `notifications` is `email`, `phone` is null, `language`
is `en`, `bio` is empty and `updated_at` is null.

**TA13 `test_save_profile`**
1. Create a user.
2. Send `PUT /users/{user_id}/profile` with the permissions `export_reports`, `create_users`, `create_users`, the
   notifications `sms`, the phone, the language `ro` and the bio `<p>Hello</p>`.
3. Send `GET /users/{user_id}/profile`.

Expected: step 2 returns 200 with `permissions` `create_users`, `export_reports` (in this order, once each), the
other values as sent, and an `updated_at`; step 3 returns the same profile.

**TA14 `test_save_invalid_profile`**
1. Create a user.
2. Send `PUT /users/{user_id}/profile` with the notifications `sms` and no phone.
3. Send it with the notifications `email` and the phone `12ab`.
4. Send it with the notifications `email` and the permission `fly`.
5. Send `GET /users/{user_id}/profile`.

Expected: steps 2 to 4 return 422; the error of step 2 says that the phone is required for SMS notifications, the
error of step 3 names the field `phone`, and the error of step 4 names the field `permissions`. Step 5 returns the
default profile: nothing was saved.

**TA15 `test_profile_unknown_user`**
1. Send `GET /users/{user_id}/profile` for a generated UUID.
2. Send `PUT /users/{user_id}/profile` with a valid profile for the same UUID.

Expected: both return 404, with the detail `User not found`.

### Team Board

**TA16 `test_move_user_between_teams`**
1. Create a user and send `GET /teams`.
2. Send `PUT /users/{user_id}/team` with team 1, then `GET /teams`.
3. Send `PUT /users/{user_id}/team` with team 2, then `GET /teams`.
4. Send `PUT /users/{user_id}/team` with team 2 again, then `GET /teams`.

Expected: every `PUT` returns 200 with the user id and the team id. After step 2 the user is a member of team 1 and
comes after every member that team 1 had in step 1; after step 3 the user is a member of team 2 and comes after every
member that team 2 had in step 2, and is not a member of team 1; after step 4 still a member of team 2, once. Tests
that run at the same time may put their own users in the teams, after the user or before, so the position is checked
only against the members that the team had before the move.

**TA17 `test_remove_user_from_team`**
1. Create a user and put them in team 1.
2. Send `DELETE /users/{user_id}/team`, then `GET /teams`.
3. Send `DELETE /users/{user_id}/team` again.

Expected: steps 2 and 3 return 200 with the message `Removed from team`; after step 2 the user is in no team.

**TA18 `test_team_errors`**
1. Send `PUT /teams/1` with the current name of team 2.
2. Send `PUT /teams/1` with the name `   ` (spaces only).
3. Send `PUT /teams/999999` with a generated name.
4. Create a user and send `PUT /users/{user_id}/team` with the team 999999.
5. Send `PUT /users/{user_id}/team` with team 1, for a generated UUID.

Expected: step 1 returns 400 with the detail `Team name already exists`; step 2 returns 422; steps 3 and 4 return
404 with the detail `Team not found`; step 5 returns 404 with the detail `User not found`. No team changed its name.

### Export & Reports

**TA19 `test_export_csv`**
1. Create three users with a prefix.
2. Send `GET /users/export.csv?search=<prefix>&role=admin`.

Expected: the status is 200; the header `Content-Type` begins with `text/csv`, and the header `Content-Disposition`
is `attachment; filename="users.csv"`; the body has the line `id,name,email,role,status,created_at`, followed by two
lines with the e-mails of the two admin users.

**TA20 `test_report_becomes_ready`**
1. Create three users with a prefix.
2. Send `POST /reports` with the type `by_role`, the search `<prefix>` and the delay 1.
3. Wait until `GET /reports/{report_id}` returns the status `ready`, for at most 10 s, sending it again at the
   polling interval of the suite (50 ms).
4. Send `GET /reports/{report_id}`.

Expected: step 2 returns 200 with the status `queued` and no result. In step 3 the status becomes `ready` within
10 s; step 4 returns the status `ready`, the progress 100, and the result `admin` 2, `viewer` 1, in this order. The
number of requests of step 3 depends on how fast the backend answers, so a suite that records its steps records the
wait as one step, not each request.

**TA21 `test_report_errors`**
1. Send `POST /reports` with the type `by_age`.
2. Send `POST /reports` with the type `by_role` and the delay 11.
3. Send `GET /reports/999999`.

Expected: steps 1 and 2 return 422; step 3 returns 404 with the detail `Report not found`.

### Session & Preferences

The session is the cookie `session_id`, which the server sets with `Set-Cookie` when a user signs in. HTTP
clients usually keep the cookies of the responses for the rest of the test and send them again by themselves, as a
browser does; a `Cookie` header that a request sends replaces them. So every step that needs a session names the
cookie it sends, in a `Cookie` header, and a step that needs no valid session runs before any sign-in of the test or
sends an invalid cookie.

**TA22 `test_sign_in`**
1. Create a user with the status `active`.
2. Send `POST /session` with the e-mail of the user, in upper case.
3. Send `GET /session` with the header `Cookie: session_id=<value from step 2>`.

Expected: step 2 returns 200 with the user and the preferences `light` and `iso`, and a header `Set-Cookie` for
`session_id` with the attribute `HttpOnly`. Step 3 returns 200 with the same user.

**TA23 `test_sign_in_errors`**
1. Send `POST /session` with a non-existing e-mail.
2. Create a user with the status `disabled` and send `POST /session` with the e-mail of the user.
3. Send `POST /session` with the e-mail `not-an-email`.
4. Send `GET /session` without a cookie (no step of the test signed in).

Expected: step 1 returns 404 with the detail `User not found`; step 2 returns 403 with the detail
`User is disabled`; step 3 returns 422; step 4 returns 401 with the detail `Not signed in`.

**TA24 `test_preferences_per_user`**
1. Create two users, A and B, and sign in as each of them (`POST /session`), keeping both cookies.
2. Send `PUT /session/preferences` with the cookie of A, the theme `dark` and the date format `eu`.
3. Send `GET /session` with the cookie of A, then with the cookie of B.
4. Send `PUT /session/preferences` with the header `Cookie: session_id=invalid`.

Expected: step 2 returns 200 with `dark` and `eu`; in step 3 A has `dark` and `eu`, and B has `light` and `iso`;
step 4 returns 401.

**TA25 `test_sign_out`**
1. Create a user and sign in (`POST /session`).
2. Send `DELETE /session` with the cookie.
3. Send `GET /session` with the same cookie.

Expected: step 2 returns 200 with the message `Signed out` and a header `Set-Cookie` that deletes `session_id`
(`Max-Age=0`); step 3 returns 401.

## Hybrid test cases

Web and API steps in the same test: the API prepares or checks the data that the user interface shows or creates.

| ID | Test name | Page and endpoint | What the test exercises |
|---|---|---|---|
| TH01 | `test_user_created_through_api_is_listed` | `POST /users`, List Users | A user created through the API is shown in the table |
| TH02 | `test_user_created_in_form_is_found_through_api` | Create User, `GET /users` | A user created with the form is returned by the API, with its picture |
| TH03 | `test_profile_saved_in_page_is_returned_by_api` | Edit User, `GET /users/{user_id}/profile` | A profile saved with the form is returned by the API |
| TH04 | `test_card_moved_on_board_is_moved_in_api` | Team Board, `GET /teams` | A drag and drop on the board changes the team in the backend |
| TH05 | `test_report_requested_through_api_in_printable_view` | `POST /reports`, printable view | A page opened by its URL, with data from the API |
| TH06 | `test_session_cookie_from_api_signs_in_the_page` | `POST /session`, Session & Preferences | A session cookie from the API, put into the browser |

**TH01 `test_user_created_through_api_is_listed`**
1. Create a user through the API.
2. Open List Users from the dashboard and search the name of the user.

Expected: a row of the table shows the name, the e-mail, the role and the status of the user (the role and the
status in lower case).

**TH02 `test_user_created_in_form_is_found_through_api`**
1. Open Create User from the dashboard, fill in the form with a generated user and the profile picture, and click
   **Create User**.
2. Send `GET /users?search=<e-mail of the user>`.

Expected: step 1 shows `User created successfully!`; in step 2 `total` is 1, and the only item has the name, e-mail,
role and status of the user and a profile picture.

**TH03 `test_profile_saved_in_page_is_returned_by_api`**
1. Create a user through the API.
2. Open Edit User from the dashboard and load the user (TEST_CASES.md, Edit User).
3. Check **Delete users**, select `Romanian` in the language list and click **Save Profile**.
4. Send `GET /users/{user_id}/profile`.

Expected: step 3 shows `Profile saved successfully!`; in step 4 `permissions` is `delete_users`, `language` is `ro`
and `notifications` is `email`.

**TH04 `test_card_moved_on_board_is_moved_in_api`**
1. Create a user through the API and put them in team 1.
2. Open Team Board from the dashboard, and drag the user's card onto the lane of team 2.
3. Send `GET /teams`.

Expected: step 2 shows `<name> moved to <team 2>.`; in step 3 the user is a member of team 2 and not of team 1.

**TH05 `test_report_requested_through_api_in_printable_view`**
1. Create three users with a prefix.
2. Send `POST /reports` with the type `by_role`, the search `<prefix>` and the delay 0.
3. Open the printable view of the report by its URL: `<base URL>/user-reports/print/<report id>`.

Expected: the title of the page is `Automation Playground - Report <report id>`, the heading is `Users by role`, the
table has the rows `admin 2` and `viewer 1`, and the total is `3`.

**TH06 `test_session_cookie_from_api_signs_in_the_page`**
1. Create a user through the API, with the status `active`.
2. Sign in through the API (`POST /session`) and read the value of the cookie `session_id`.
3. Open the base URL, and set the cookie `session_id` with this value in the browser.
4. Open Session & Preferences from the dashboard.

Expected: the page shows `Signed in as <name> (<e-mail>)`, without signing in through the page. The server reads
only the value of the cookie, so a cookie set by the test without the attribute `HttpOnly` works as well.
