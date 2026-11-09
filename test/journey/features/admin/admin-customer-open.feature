Feature: Admin opens customers found by search

@role:admin @feature:admin-customer-open @TC-107 @ui
Scenario Outline: A customer found by QAL number opens its details
  Given an admin opens the "contractsSearch" admin page
  When they search "contracts" for "<qal>"
  And they open the search result "<qal>"
  Then the page shows the text "<qal>"
  And no admin server error page is shown

  Examples:
    | qal |
    | QAL/2044 |
