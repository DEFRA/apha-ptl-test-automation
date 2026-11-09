Feature: Remove and Delete actions outside the editable lists

@role:admin @feature:admin-remove-actions @TC-155 @ui @creates-data @irreversible
Scenario Outline: An exported file is deleted from its export page
  Given an admin opens the "exports" admin page
  When they select the list link "<export>"
  And they confirm the first visible "Delete" link
  Then no admin server error page is shown

  Examples:
    | export                              |
    | Export Contracts                    |
    | Export Job Sheets                   |
    | Export Renewal Letters              |
    | Export Address Confirmation Letters |

@role:admin @feature:admin-remove-actions @TC-156 @ui @creates-data @irreversible
Scenario: An item is removed from a contract
  Given an admin opens the "customers" admin page
  When they select the list link "Contracts"
  And they select the list link "Contract Items"
  And they confirm the first visible "Remove" link
  Then no admin server error page is shown

@role:admin @feature:admin-remove-actions @TC-157 @ui @creates-data @irreversible
Scenario: A viewer is removed from a participant
  Given an admin opens the "customers" admin page
  When they select the list link "Participants"
  And they select the list link "Viewers"
  And they press the button "<--Remove"
  Then no admin server error page is shown

@role:admin @feature:admin-remove-actions @TC-158 @ui @creates-data @irreversible
Scenario: An item is removed from a scheme
  Given an admin opens the "schemes" admin page
  When they select the list link "Details"
  And they select the scheme tab "Tests"
  And they confirm the first visible "Remove" link
  Then no admin server error page is shown

