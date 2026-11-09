Feature: Admin list behaviour

@role:admin @feature:admin-lists-behaviour @TC-087 @ui
Scenario: The Customers list moves to its next page
  Given an admin follows the click path "Manage Contracts > Customers"
  When they note the first row of the list
  And they select page "2" of the list
  Then the "customers" admin page is shown
  And the first row of the list has changed

@role:admin @feature:admin-lists-behaviour @TC-088 @ui
Scenario Outline: Selecting a year keeps the page and shows no error
  Given an admin follows the click path "<path>"
  When they select the year "<year>" in the "<selector>" dropdown
  Then the destination heading is "<heading>"
  And no admin server error page is shown

  Examples:
    | path | selector | year | heading |
    | System Administration > Weighted Pricing Plan | ddlYear | 2010/11 | Weighted Pricing Plan |

@role:admin @feature:admin-lists-behaviour @TC-089 @ui
Scenario: A customer search by a known QAL number lists that customer
  Given an admin follows the click path "Manage Contracts > Search"
  When they search "contracts" for "QAL/0344"
  Then the "contractsSearch" admin page is shown
  And the search results include "QAL/0344"
