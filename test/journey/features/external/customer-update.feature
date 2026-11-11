Feature: Customer details update and admin review

  Background:
    Given the customer is logged in

@feature:customer-update @TC-095 @ui @creates-data @mode:serial
Scenario: Submitting a changed customer contact name locks the form
  Given the seeded customer has no pending details update
  When the customer submits a new unique contact name
  Then the customer details form is locked

@feature:customer-update @TC-096 @ui @creates-data @mode:serial
Scenario: An admin declines a pending customer update and the customer can edit again
  Given the seeded customer has no pending details update
  When the customer submits a new unique contact name
  And an admin declines the pending customer update
  And the customer opens their details again
  Then the customer details form is editable
  And the contact name is the original value

@feature:customer-update @TC-097 @ui @creates-data @mode:serial
Scenario: An admin approves a pending customer update that changes nothing
  Given the seeded customer has no pending details update
  When the customer submits the contact name unchanged
  Then the customer details form is locked
  When an admin approves the pending customer update
  And the customer opens their details again
  Then the customer details form is editable
  And the contact name is the original value

