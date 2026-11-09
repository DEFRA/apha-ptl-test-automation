Feature: Admin click paths to parameterised pages

@role:admin @feature:admin-click-paths @TC-081 @ui
Scenario Outline: Following the menu and list links reaches the page that needs an id
  Given an admin follows the click path "<path>"
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | path | heading |
    | Manage Contracts > Customers > Details | Customer Details |
