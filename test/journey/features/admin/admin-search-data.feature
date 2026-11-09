Feature: Admin search against real data

@role:admin @feature:admin-search-data @TC-091 @ui
Scenario Outline: A customer search by a known QAL number lists that customer
  Given an admin opens the "contractsSearch" admin page
  When they search "contracts" for "<qal>"
  Then the "contractsSearch" admin page is shown
  And the search results include "<qal>"

  Examples:
    | qal |
    | QAL/2044 |

@role:admin @feature:admin-search-data @TC-092 @ui
Scenario Outline: A scheme search by a known name lists that scheme
  Given an admin opens the "schemesSearch" admin page
  When they search "schemes" for "<name>"
  Then the "schemesSearch" admin page is shown
  And the search results include "<name>"

  Examples:
    | name |
    | Tissue Copper |
