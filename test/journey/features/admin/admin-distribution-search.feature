Feature: Admin distribution search with real distribution numbers

@role:admin @feature:admin-distribution-search @TC-106 @ui
Scenario Outline: A distribution search by a known reference lists that distribution
  Given an admin opens the "distributionsSearch" admin page
  When they search "distributions" for "<reference>"
  Then the "distributionsSearch" admin page is shown
  And no admin server error page is shown

  Examples:
    | reference |
    | 17347/BA |
