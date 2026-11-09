@mode:serial
Feature: Admin group addresses

@role:admin @feature:admin-group-address @TC-044 @ui @creates-data
Scenario: Admin edits an existing group address and the change is saved
  Given an admin opens the first group address for editing
  When they change the packing instructions to a unique value
  And they save the group address
  Then the "groupAddresses" admin page is shown
  When they reopen the same group address
  Then the packing instructions show the new value

@role:admin @feature:admin-group-address @TC-045 @ui
Scenario: Admin cancels an edit of a group address and nothing changes
  Given an admin opens the first group address for editing
  When they change the packing instructions to a unique value
  And they cancel the group address form
  Then the "groupAddresses" admin page is shown
  When they reopen the same group address
  Then the packing instructions show the original value

@role:admin @feature:admin-group-address @TC-046 @ui @negative
Scenario: Required fields block saving a new group address
  Given an admin opens the create group address page
  When they save the group address
  Then the four required field messages are shown
  And the "groupAddressCreate" admin page is shown

@role:admin @feature:admin-group-address @TC-047 @ui @creates-data
Scenario: Admin creates a new group address and it is listed
  Given an admin opens the create group address page
  When they enter a new group address with a unique identifier
  And they save the group address
  Then the "groupAddresses" admin page is shown
  And the new group address is listed

@role:admin @feature:admin-group-address @TC-048 @ui @creates-data
Scenario: Admin changes the Telephone of a group address and restores it
  Given an admin opens the first group address for editing
  When they change the telephone to a synthetic number
  And they save the group address
  Then the "groupAddresses" admin page is shown
  When they reopen the same group address
  Then the telephone shows the synthetic number
