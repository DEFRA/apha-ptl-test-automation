Feature: Admin home menu

@role:admin @feature:admin-home-menu @TC-018 @ui @smoke
Scenario: Admin home page shows the Home heading and the menu links
  Given an admin opens the "home" admin page
  Then the admin home page shows the menu links

@role:admin @feature:admin-home-menu @TC-019 @ui
Scenario Outline: Each menu link opens its menu page without an error page
  Given an admin opens the "home" admin page
  When they select the admin menu link for "<page>"
  Then the "<page>" admin page is shown
  And no admin server error page is shown

  Examples:
    | page                 |
    | systemAdministration |

@role:admin @feature:admin-home-menu @TC-020 @ui
Scenario: Help link points to the quick reference guide
  Given an admin opens the "home" admin page
  Then the admin Help link points to the quick reference guide
