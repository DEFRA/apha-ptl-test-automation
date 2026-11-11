@mode:serial
Feature: External participant details

  Background:
    Given the customer is logged in

@feature:external-participant-details @TC-049 @ui
Scenario: Participant details page shows the fields and buttons
  Given a signed-in customer opens the "myAccount" page
  Then the participant form shows its fields and buttons

@feature:external-participant-details @TC-050 @ui @negative
Scenario: Submitting participant details without a Country is blocked
  Given the seeded participant has no pending details update
  When they submit the participant form without a country
  Then the participant country message is shown

@feature:external-participant-details @TC-051 @ui
Scenario: Cancel on participant details returns to Home without saving
  Given a signed-in customer opens the "myAccount" page
  When they cancel the participant form
  Then the "home" page is shown

@feature:external-participant-details @TC-052 @ui @creates-data
Scenario: A valid participant update is submitted and the confirmation shows
  Given the seeded participant has no pending details update
  When they submit the participant form with valid synthetic details
  Then the participant update confirmation is shown

