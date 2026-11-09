Feature: Customer account details

@role:applicant @feature:customer-account @TC-001 @ui @smoke
Scenario: Customer can update their details with valid contact information
  Given a signed-in customer opens the Edit Customer/Invoice details page
  When they update the required customer and invoice fields with valid values
  Then the customer details are saved and a success message is shown

@role:applicant @feature:customer-account @TC-002 @ui @negative
Scenario: Customer is blocked from saving when required contact details are empty
  Given a signed-in customer opens the Edit Customer/Invoice details page
  When they leave required customer contact details blank and submit
  Then the page shows the required field validation messages and prevents the save

@role:applicant @feature:customer-account @TC-003 @ui @negative @creates-data
Scenario: Customer cannot submit an order until terms and required consent declarations are accepted
  Given the customer has the order page open
  When they select an available scheme
  And they continue to the pending order
  Then the order submit button is disabled

