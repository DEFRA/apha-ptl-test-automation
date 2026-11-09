Feature: Admin list drill-down

@role:admin @feature:admin-list-drilldown @TC-078 @ui
Scenario Outline: Following a list link opens the expected page
  Given the surveyed "admin-<list>" page is opened
  When they select the list link "<link>"
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | list | link | heading |
    | contracts-admin-customerlist | Create Customer | Create Customer |
