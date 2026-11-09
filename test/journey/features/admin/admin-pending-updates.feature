Feature: Admin pending updates

@role:admin @feature:admin-pending-updates @TC-053 @ui
Scenario: Pending customer updates list shows QAL Number, Customer Name and Details
  Given an admin opens the "pendingCustomerUpdates" admin page
  Then the pending customer updates table shows its columns and at least one row

@role:admin @feature:admin-pending-updates @TC-054 @ui
Scenario: Pending customer update details show Approve, Decline and Cancel and Cancel changes nothing
  Given an admin opens the "pendingCustomerUpdates" admin page
  When they open the first pending customer update
  Then the pending update shows the Approve, Decline and Cancel buttons
  When they cancel the pending update review
  Then the "pendingCustomerUpdates" admin page is shown
  And the pending customer updates table shows its columns and at least one row

@role:admin @feature:admin-pending-updates @TC-055 @ui
Scenario: Pending participant updates page opens with its heading
  Given an admin opens the "pendingParticipantUpdates" admin page
  Then no admin server error page is shown

@role:applicant @feature:admin-pending-updates @TC-056 @ui @creates-data
Scenario: Admin approves and declines pending customer updates
  Given the seeded customer has no pending details update
  When the customer submits the contact name unchanged
  And an admin approves the pending customer update
  And the customer opens their details again
  And the customer submits a new unique contact name
  And an admin declines the pending customer update
  And the customer opens their details again
  Then the customer details form is editable
  And the contact name is the original value

