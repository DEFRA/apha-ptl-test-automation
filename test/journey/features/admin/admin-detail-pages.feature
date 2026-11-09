Feature: Admin detail pages

@role:admin @feature:admin-detail-pages @TC-083 @ui
Scenario Outline: Detail pages show their action buttons
  Given an admin follows the click path "<path>"
  Then the page shows the button "<button>"

  Examples:
    | path | button |
    | Manage Contracts > Customers > Details | Copy from Customer Contact |

@role:admin @feature:admin-detail-pages @TC-084 @ui
Scenario Outline: Detail pages show their field labels
  Given an admin follows the click path "<path>"
  Then the page shows the label "<label>"

  Examples:
    | path | label |
    | Manage Contracts > Customers > Details | QAL Number: |

@role:admin @feature:admin-detail-pages @TC-085 @ui
Scenario Outline: Scheme Details shows its tabs
  Given an admin follows the click path "<path>"
  Then the page shows the tab "<tab>"

  Examples:
    | path | tab |
    | Manage Schemes > Schemes > Details | Details |
    | Manage Schemes > Schemes > Details | Tests |
    | Manage Schemes > Schemes > Details | Distribution Level Data |
    | Manage Schemes > Schemes > Details | Results Tabulations |
    | Manage Schemes > Schemes > Details | Test consultants |
    | Manage Schemes > Schemes > Details | Viewers |

@role:admin @feature:admin-detail-pages @TC-086 @ui
Scenario Outline: Cancel on a detail page returns to its list without saving
  Given an admin follows the click path "<path>"
  When they cancel the form
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | path | heading |
    | Manage Contracts > Customers > Details | Customers |
    | Manage Contracts > Customers > Participants > Details | Participants |
    | Manage Contracts > Customers > Participants > Viewers | Participants |
    | Manage Contracts > Customers > Contracts > Details | Contracts |
    | Manage Schemes > Schemes > Details | Schemes |
