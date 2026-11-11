Feature: External home page

  Background:
    Given the customer is logged in

@feature:external-home @TC-006 @ui @smoke
Scenario: Home page shows the heading and the five sections in order
  Given a signed-in customer opens the "home" page
  Then no server error page is shown
  And the home sections are shown in order

@feature:external-home @TC-007 @ui
Scenario: Home page shows the nine action cards
  Given a signed-in customer opens the "home" page
  Then the nine action cards are shown

@feature:external-home @TC-008 @ui
Scenario: Header shows the signed-in user name and the header links
  Given a signed-in customer opens the "home" page
  Then the header shows the signed-in user name and the header links

@feature:external-home @TC-009 @ui
Scenario: View Information link opens the Information page
  Given a signed-in customer opens the "home" page
  When they select the home page link "information"
  Then the "information" page is shown
  And no server error page is shown

@feature:external-home @TC-010 @ui
Scenario: My account link opens the My account page
  Given a signed-in customer opens the "home" page
  When they select the home page link "myAccount"
  Then the "myAccount" page is shown
  And no server error page is shown
