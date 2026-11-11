Feature: External distributions

  Background:
    Given the customer is logged in

@feature:external-distributions @TC-031 @ui @smoke
Scenario: Enter results card on Home opens the Current Distributions page
  Given a signed-in customer opens the "home" page
  When they select the home card "enterResults"
  Then the "currentDistributions" page is shown
  And no server error page is shown

@feature:external-distributions @TC-032 @ui
Scenario: Current Distributions shows the empty-state message and no search form
  Given a signed-in customer opens the "currentDistributions" page
  Then no server error page is shown
  And the "noCurrentDistributions" message is shown
  And no search form is shown
  When they reload the page
  Then the "currentDistributions" page is shown
  And the "noCurrentDistributions" message is shown

@feature:external-distributions @TC-033 @ui
Scenario: View results card on Home opens the Previous Distributions page
  Given a signed-in customer opens the "home" page
  When they select the home card "viewResults"
  Then the "previousDistributions" page is shown
  And no server error page is shown

@feature:external-distributions @TC-034 @ui
Scenario: Previous Distributions shows the search form and the empty-state message
  Given a signed-in customer opens the "previousDistributions" page
  Then no server error page is shown
  And the "previousDistributions" search form is shown
  And the distribution list is shown
  When they reload the page
  Then the "previousDistributions" page is shown
  And the "previousDistributions" search form is shown

@feature:external-distributions @TC-035 @ui @negative
Scenario: Searching Previous Distributions with an unknown reference keeps the empty result
  Given a signed-in customer opens the "previousDistributions" page
  When they enter the unknown distribution reference
  And they select SEARCH
  Then the "previousDistributions" page is shown
  And no server error page is shown
  And the "noDistributions" message is shown
  When they select SHOW ALL
  Then the "previousDistributions" page is shown
  And the "previousDistributions" search form is shown
  And the distribution reference box is empty
  And the distribution list is shown

