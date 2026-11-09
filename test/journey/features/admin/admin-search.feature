Feature: Admin search

@role:admin @feature:admin-search @TC-057 @ui @negative
Scenario: Scheme search with an unknown name shows no results
  Given an admin opens the "schemesSearch" admin page
  When they search "schemes" for "ZZ-NO-SUCH-SCHEME"
  Then the "schemesSearch" admin page is shown
  And the search shows no results

@role:admin @feature:admin-search @TC-058 @ui
Scenario: Scheme search with a known name lists results
  Given an admin opens the "schemesSearch" admin page
  When they search "schemes" for "African Horse Sickness"
  Then the "schemesSearch" admin page is shown
  And the search shows some results
  And the search results include "African Horse Sickness"

@role:admin @feature:admin-search @TC-059 @ui @negative
Scenario: Distribution search by an unknown number shows no results
  Given an admin opens the "distributionsSearch" admin page
  Then the "distributions" search shows its box and button
  When they search "distributions" for "ZZ-NO-SUCH-DIST"
  Then the "distributionsSearch" admin page is shown
  And the search shows no results

@role:admin @feature:admin-search @TC-060 @ui
Scenario: Distributions Search shows the Distribution Number and Sample Number tabs
  Given an admin opens the "distributionsSearch" admin page
  Then the distribution search tabs are shown
  And the "distributions" search shows its box and button
  And no admin server error page is shown

@role:admin @feature:admin-search @TC-061 @ui @negative
Scenario: Contracts customer search shows its fields and an unknown QAL keeps the page
  Given an admin opens the "contractsSearch" admin page
  Then the contracts search tabs and customer fields are shown
  When they search "contracts" for "ZZ-NO-SUCH-QAL"
  Then the "contractsSearch" admin page is shown
  And no admin server error page is shown

@role:admin @feature:admin-search @TC-062 @ui @negative
Scenario: Create User search with an unknown id keeps the page and creates no user
  Given an admin opens the "userCreate" admin page
  Then the user search instruction is shown
  When they search "users" for "zz999999"
  Then the "userCreate" admin page is shown
  And no admin server error page is shown
