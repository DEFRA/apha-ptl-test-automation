Feature: Admin system administration

@role:admin @feature:admin-system-administration @TC-024 @ui
Scenario Outline: Manage Roles and Create User pages load without saving anything
  Given an admin opens the "<page>" admin page
  When they reload the admin page
  Then the "<page>" admin page is shown
  And no admin server error page is shown

  Examples:
    | page       |
    | userRoles  |
    | userCreate |

@role:admin @feature:admin-system-administration @TC-025 @ui
Scenario: Internal Test Consultant Department page loads with its heading
  Given an admin opens the "home" admin page
  When they select the admin menu link for "systemAdministration"
  Then the "systemAdministration" admin page is shown
  Given an admin opens the "tcDepartment" admin page
  Then no admin server error page is shown

@role:admin @feature:admin-system-administration @TC-026 @ui
Scenario Outline: Pricing plan pages load with their expected heading for each page
  Given an admin opens the "<page>" admin page
  When they reload the admin page
  Then the "<page>" admin page is shown
  And no admin server error page is shown

  Examples:
    | page            |
    | weightedPricing |
    | postagePricing  |
