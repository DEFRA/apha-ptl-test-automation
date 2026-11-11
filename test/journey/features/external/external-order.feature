Feature: Order wizard

  Background:
    Given the customer is logged in

@feature:external-order @TC-110 @ui @creates-data
Scenario: Selecting an available scheme ticks it and enables Next
  Given the customer has the order page open
  When they select an available scheme
  Then the selected scheme is ticked
  And the next button is enabled

@feature:external-order @TC-111 @ui @creates-data
Scenario: Next opens the pending order summary with its buttons
  Given the customer has the order page open
  When they select an available scheme
  And they continue to the pending order
  Then the pending order summary lists the scheme and its buttons
  And the order submit button is disabled

@feature:external-order @TC-112 @ui @creates-data
Scenario: PREVIOUS returns from the summary to the first step
  Given the customer has the order page open
  When they select an available scheme
  And they continue to the pending order
  And they go back to the order page
  Then the first step of the order is shown again
  And the selected scheme is ticked

@feature:external-order @TC-113 @ui @creates-data
Scenario: Accepting the terms enables SUBMIT on the summary
  Given the customer has the order page open
  When they select an available scheme
  And they continue to the pending order
  And they accept the terms and conditions
  Then the order submit button is enabled

@feature:external-order @TC-114 @ui @creates-data
Scenario: SAVE keeps the pending order on the summary
  Given the customer has the order page open
  When they select an available scheme
  And they continue to the pending order
  And they save the pending order
  Then the pending order is reported as saved


@feature:external-order @TC-115 @ui @creates-data
Scenario: A customer submits an order and the admin declines it, leaving no order behind
  Given the seeded customer has no order awaiting review
  When they select an available scheme
  And they continue to the pending order
  And they accept the terms and conditions
  And they tick any consent declarations shown
  And they submit the order
  Then the customer is returned to Home
  And the order is waiting for admin review
  When an admin declines the pending order
  Then the order is no longer waiting for admin review
  And a new order starts without a selection

@feature:external-order @TC-116 @ui @creates-data
Scenario: Next stays disabled while no scheme is selected
  Given the customer has the order page open
  Then the next button is disabled

@feature:external-order @TC-117 @ui @creates-data
Scenario: Deselecting the only selected scheme disables Next again
  Given the customer has the order page open
  When they select an available scheme
  And they deselect that scheme
  Then the next button is disabled
