Feature: Participant details update and admin review

  Background:
    Given the customer is logged in

@feature:participant-update @TC-098 @ui @creates-data @mode:serial
Scenario: Submitting a changed participant contact name locks the form
  Given the seeded participant has no pending details update
  When the participant submits a new unique contact name
  Then the participant details form is locked

@feature:participant-update @TC-099 @ui @creates-data @mode:serial
Scenario: An admin declines a pending participant update and the participant can edit again
  Given the seeded participant has no pending details update
  When the participant submits a new unique contact name
  And an admin declines the pending participant update
  And the participant opens their details again
  Then the participant details form is editable
  And the participant contact name is the original value

@feature:participant-update @TC-100 @ui @creates-data @mode:serial
Scenario: An admin approves a pending participant update that changes nothing
  Given the seeded participant has no pending details update
  When the participant submits the contact name unchanged
  Then the participant details form is locked
  When an admin approves the pending participant update
  And the participant opens their details again
  Then the participant details form is editable
  And the participant contact name is the original value
