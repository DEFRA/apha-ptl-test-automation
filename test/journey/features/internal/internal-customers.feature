@feature:internal-customers @role:internal
Feature: Internal customers
  Contracts Admin staff list customers by status and create them with validation.
  Source: Features/Customer/CustomerController.cs, Views/Index.cshtml, CustomerViewModel.cs

  @TC-INT-020 @smoke
  Scenario: Customer list is shown with its status filter and columns
    When the user opens the internal customer list
    Then the internal customer list is shown
    And the customer list offers the Active, Inactive and All status filters
    And the customer table has the expected columns

  @TC-INT-021 @regression
  Scenario Outline: Customer list can be filtered by status
    When the user opens the internal customer list
    And the user filters the customer list by status "<status>"
    Then every customer listed has the status "<status>"

    Examples:
      | status   |
      | Active   |
      | Inactive |

  @TC-INT-022 @regression
  Scenario: Create customer cannot be submitted without the mandatory fields
    When the user opens the internal create customer form
    And the user submits the create customer form without entering anything
    Then the create customer form shows the mandatory field errors
    And selecting an error link moves focus to its field

  @TC-INT-023 @regression
  Scenario Outline: Create customer rejects invalid field values
    When the user opens the internal create customer form
    And the user enters "<value>" in the customer field "<field>"
    And the user submits the create customer form
    Then the create customer form shows the error "<message>"

    Examples:
      | field                  | value    | message                                                |
      | Registered File Number | XYZ/123  | Registered file number must match the format QAL/nnnnn |
      | Telephone              | abc      | Telephone contains characters that are not allowed     |
      | Email                  | not-mail | Enter a valid email address                            |

  @TC-INT-024 @regression
  Scenario: Create customer limits the name to 50 characters
    When the user opens the internal create customer form
    Then the customer field "Name" accepts at most 50 characters

  @TC-INT-025 @regression
  Scenario: Cancelling create customer returns to the customer list
    When the user opens the internal create customer form
    And the user cancels the create customer form
    Then the user is back on the customer list
