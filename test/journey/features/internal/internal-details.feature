@feature:internal-details @role:internal
Feature: Internal customer details, edit and create-form validation
  Contracts Admin and Scheme Admin staff drill into a customer and rely on form validation. Nothing here saves data.
  Source: Features/Customer, Participant, GroupAddress, Scheme, Contract controllers and views

  @TC-INT-040 @smoke
  Scenario: Customer details shows the customer, its sections and actions
    When the user opens the internal customer list
    And the user opens the details of the first customer in the list
    Then the customer details page shows the customer name and its sections
    And the customer details page offers the customer actions

  @TC-INT-041 @regression
  Scenario Outline: Customer details links to the customer's participants and contracts
    When the user opens the internal customer list
    And the user opens the details of the first customer in the list
    And the user follows "<link>" from the customer details
    Then the internal page headed "<heading>" is shown

    Examples:
      | link                    | heading      |
      | Go to Participants Page | Participants |
      | Go to Contracts Page    | Contracts    |

  @TC-INT-042 @regression
  Scenario: Edit customer is filled with the customer's name and rejects a blank name
    When the user opens the internal customer list
    And the user opens the details of the first customer in the list
    And the user opens the edit form for the customer
    Then the edit customer form is filled with the customer name
    When the user clears the customer name and saves the changes
    Then the form shows the error "Enter Name"

  @TC-INT-043 @regression
  Scenario Outline: Customer list tolerates unusual paging values
    When the user opens the customer list with the paging query "<query>"
    Then the customer list is still shown

    Examples:
      | query                  |
      | page=0                 |
      | page=-1                |
      | page=abc               |
      | page=999999            |
      | status=All&pageSize=0  |
      | status=bogus           |

  @TC-INT-050 @regression
  Scenario Outline: Create form without data shows the mandatory field errors
    When the user opens the create form at "<path>"
    And the user submits the form with the "<button>" button
    Then the form shows the error "<message>"

    Examples:
      | path                | button | message                      |
      | /GroupAddress/Create | Save   | Enter an identifier          |
      | /GroupAddress/Create | Save   | Enter address line 1         |
      | /GroupAddress/Create | Save   | Enter address line 2         |
      | /GroupAddress/Create | Save   | Select a country             |
      | /Scheme/Create       | Save   | Enter the scheme identifier  |
      | /Scheme/Create       | Save   | Enter the scheme name        |

  @TC-INT-051 @regression
  Scenario Outline: Create participant without data shows the mandatory field errors
    When the user opens the internal customer list
    And the user opens the details of the first customer in the list
    And the user opens the create form for "Participant" from the customer
    And the user submits the form with the "Create Participant" button
    Then the form shows the error "<message>"

    Examples:
      | message                   |
      | Enter a lab name          |
      | Enter a contact name      |
      | Enter an organisation name |
      | Enter address line 1      |
      | Enter address line 2      |
      | Select a country          |
      | Enter a telephone number  |
      | Enter an email address    |

  @TC-INT-052 @regression
  Scenario Outline: Group address field limits
    When the user opens the create form at "/GroupAddress/Create"
    Then the form field "<field>" accepts at most <max> characters

    Examples:
      | field      | max |
      | Identifier | 50  |
      | Address 1  | 100 |
      | Telephone  | 20  |


