Feature: Admin list pages

@role:admin @feature:admin-list-pages @TC-021 @ui @smoke
Scenario Outline: Contracts Admin list pages load with their expected heading
  Given an admin opens the "<page>" admin page
  When they reload the admin page
  Then the "<page>" admin page is shown
  And no admin server error page is shown

  Examples:
    | page            |
    | customers       |
    | contractsSearch |
    | groupAddresses  |
    | exports         |

@role:admin @feature:admin-list-pages @TC-022 @ui
Scenario Outline: Scheme Admin list pages load with their expected heading
  Given an admin opens the "<page>" admin page
  When they reload the admin page
  Then the "<page>" admin page is shown
  And no admin server error page is shown

  Examples:
    | page            |
    | schemes         |

@role:admin @feature:admin-list-pages @TC-023 @ui
Scenario Outline: Distributions label pages load with their expected heading
  Given an admin opens the "<page>" admin page
  When they reload the admin page
  Then the "<page>" admin page is shown
  And no admin server error page is shown

  Examples:
    | page                |
    | participantAddress  |
    | groupAddressLabels  |
    | distributionsSearch |
    | distributions       |
