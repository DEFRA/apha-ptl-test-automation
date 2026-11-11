Feature: Distribution lists, results and reports with real data

  Background:
    Given the customer is logged in

@feature:external-distribution-data @TC-101 @ui
Scenario Outline: Previous Distributions finds a distribution by its reference
  Given the customer opens the clean distribution list "previousDistributions"
  When they search the list for the distribution reference "<reference>"
  Then the list shows a row with "<reference>" and "<code>"

  Examples:
    | reference | code |
    | 17347/BA | PT0210 |

@feature:external-distribution-data @TC-102 @ui
Scenario Outline: Previous Distributions finds distributions by scheme code
  Given the customer opens the clean distribution list "previousDistributions"
  When they search the list for the scheme code "<part>"
  Then the list shows a row with the scheme code "<code>"

  Examples:
    | code | part |
    | PT0210 | 0210 |

@feature:external-distribution-data @TC-103 @ui
Scenario Outline: View opens the results of a previous distribution
  Given the customer opens the clean distribution list "previousDistributions"
  When they open the "View" link of the row "<reference>"
  Then the page heading is "View Results" and it shows "<reference>"
  And no server error page is shown

  Examples:
    | reference |
    | 17347/BA |

@feature:external-distribution-data @TC-104 @ui
Scenario Outline: View opens the report of a distribution
  Given the customer opens the clean distribution list "reports"
  When they open the "View" link of the row "<reference>"
  Then the page heading is "View reports" and it shows "<reference>"
  And the report shows the buttons "GENERATE PDF" and "BACK"
  And no server error page is shown

  Examples:
    | reference |
    | 13941/SE |

@feature:external-distribution-data @TC-105 @ui
Scenario Outline: BACK on a results or report page returns to its list
  Given the customer opens the clean distribution list "<list>"
  When they open the "View" link of the first row
  And they select BACK
  Then the "<list>" page is shown

  Examples:
    | list |
    | previousDistributions |
    | reports |
