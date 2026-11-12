@feature:internal-lifecycle @role:internal
Feature: Internal create and edit success
  Staff create and edit customers, participants, contracts and group addresses. Records cannot be deleted, so each scenario uses synthetic QAT names and deactivates its customer afterwards.
  Source: Features/Customer, Participant, Contract, GroupAddress controllers; success banners observed live.

  @TC-INT-130 @regression @write
  Scenario: A customer can be created, found by name and edited
    Given a new customer created through the create customer form
    Then the user is told that "Customer created successfully."
    When the user finds the customer by searching for its name
    Then the customer details page is headed with the customer name
    When the user changes the customer contact name to "Janet Smith" and saves
    Then the user is told that "Customer updated successfully."
    When the user finds the customer by searching for its name
    Then the customer details show the contact name "Janet Smith"

  @TC-INT-131 @regression @write
  Scenario: A customer can be deactivated
    Given a new customer created through the create customer form
    When the user finds the customer by searching for its name
    And the user deactivates the customer and saves
    Then the user is told that "Customer updated successfully."
    When the user finds the customer by searching for its name
    Then the customer details show the status "Inactive"

  @TC-INT-132 @regression @write
  Scenario: A participant can be created for a customer and edited
    Given a new customer created through the create customer form
    When the user finds the customer by searching for its name
    And the user creates a participant for the customer
    Then the user is told that "Participant created successfully."
    And the participant list includes the new participant
    When the user changes the participant contact name to "Janet Smith" and saves
    Then the user is told that "Participant updated successfully."

  @TC-INT-133 @regression @write
  Scenario: A contract can be created for a customer, edited and its items opened
    Given a new customer created through the create customer form
    When the user finds the customer by searching for its name
    And the user creates a contract for the customer
    Then the user is told that "Contract created successfully."
    And the contract list shows one contract for the customer
    When the user changes the contract signatory to "Janet Smith" and saves
    Then the user is told that "Contract updated successfully."
    When the user opens the contract items of the contract
    Then the contract items page offers to add a contract item

  @TC-INT-134 @regression @write
  Scenario: A group address can be created and edited
    When the user creates a group address with a unique identifier
    Then the user is told that "Group Address created successfully."
    And the group address list includes the new group address
    When the user changes the group address line 3 to "Testshire" and saves
    Then the user is told that "Group Address updated successfully."
