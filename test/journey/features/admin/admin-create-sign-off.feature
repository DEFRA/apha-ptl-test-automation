Feature: Create participant, create contract and sign-off actions

@role:admin @feature:admin-create-sign-off @TC-152 @ui @creates-data
Scenario: A participant is created for a customer
  Given an admin has opened the "Participants" list of the first customer
  When they open the create "participant" form
  And they fill the new "participant" with a unique value
  And they save the "participant" form
  Then no server error is shown after saving the "participant"

@role:admin @feature:admin-create-sign-off @TC-153 @ui @creates-data
Scenario: A contract is created for a customer
  Given an admin has opened the "Contracts" list of the first customer
  When they open the create "contract" form
  And they fill the new "contract" with a unique value
  And they save the "contract" form
  Then no server error is shown after saving the "contract"

@role:admin @feature:admin-create-sign-off @TC-154 @ui @creates-data @irreversible
Scenario Outline: A tabulation is signed off or rejected
  Given an admin opens the "resultsSignOff" admin page
  When they open the first tabulation waiting for sign-off
  And they press "<action>" on the tabulation
  Then the tabulation page is answered without a server error

  Examples:
    | action    |
    | authorise |
    | reject    |
