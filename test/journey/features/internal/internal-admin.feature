@feature:internal-admin @role:internal
Feature: Internal administration forms
  Validation of system and scheme administration forms, and add/remove of uniquely named test records that clean up after themselves.
  Source: Features/SystemAdministration, Features/SchemeAdmin, Features/Scheme; live probe docs/internal/discovery/validation-probe.json

  @TC-INT-080 @regression
  Scenario Outline: Adding to a scheme administration list without a name is rejected
    When the user goes to "<path>"
    And the user presses "Add"
    Then the form shows the error "<message>"

    Examples:
      | path                            | message                                |
      | /SchemeAdmin/CategoryItemType   | Enter a new category name              |
      | /SchemeAdmin/TestType           | Enter a new test type name             |
      | /SchemeAdmin/CriterionItemType  | Enter a new criterion item name        |
      | /SchemeAdmin/TestResultItemType | Enter a new test result item name      |
      | /SchemeAdmin/TestResultItemType | Select a return type                   |
      | /SchemeAdmin/TestMethodItemType | Enter a new test method item name      |
      | /SchemeAdmin/TestMethodItemType | Select a return type                   |

  @TC-INT-081 @regression
  Scenario Outline: Adding a person or country without details is rejected
    When the user goes to "<path>"
    And the user presses "Add"
    Then the form shows the error "<message>"

    Examples:
      | path                                                   | message                           |
      | /SystemAdministration/CountryManagement                | Enter a country name              |
      | /SystemAdministration/ViewerManagement                 | Enter a name                      |
      | /SystemAdministration/ViewerManagement                 | Enter an email address            |
      | /SystemAdministration/ExternalTestConsultantManagement | Enter a name                      |
      | /SystemAdministration/ExternalTestConsultantManagement | Enter an email address            |
      | /SystemAdministration/ExternalTestConsultantManagement | The Department field is required. |

  @TC-INT-082 @regression
  Scenario: A viewer with an invalid email is rejected
    When the user goes to "/SystemAdministration/ViewerManagement"
    And the user fills "Name" with "QA Invalid Email"
    And the user fills "Email" with "bad"
    And the user presses "Add"
    Then the form shows the error "Enter an email address in the correct format"

  @TC-INT-083 @regression
  Scenario: Create user search without a term is rejected
    When the user goes to "/SystemAdministration/CreateUser"
    And the user presses "Search"
    Then the form shows the error "Enter an employee number, first name or last name"

  @TC-INT-084 @regression
  Scenario: External site email address must be valid
    When the user goes to "/SystemAdministration/ExternalSiteManagement"
    And the user fills "Edit error screen email address" with "not-an-email"
    And the user presses "Save"
    Then the form shows the error "The Email Address is invalid"

  @TC-INT-085 @regression
  Scenario Outline: Administration charge price must be a non-negative number
    When the user goes to "/SystemAdministration/AdministrationCharge"
    And the user fills the field containing "GBP" with "<price>"
    And the user presses "Save"
    Then the form shows the error "<message>"

    Examples:
      | price | message                       |
      | abc   | Enter a valid value for Price |
      | -5    | Price must not be negative    |

  @TC-INT-086 @regression
  Scenario Outline: Create scheme without data lists every mandatory field
    When the user goes to "/Scheme/Create"
    And the user presses "Save"
    Then the form shows the error "<message>"

    Examples:
      | message                                                                                          |
      | Enter the scheme identifier                                                                      |
      | Enter the scheme name                                                                            |
      | Select a schedule                                                                                |
      | Select a schedule code                                                                           |
      | Enter the number of samples                                                                      |
      | Enter the sample origin                                                                          |
      | Enter the deadline                                                                               |
      | Enter the customs volume                                                                         |
      | Enter the customs description                                                                    |
      | Enter the instructions                                                                           |
      | Select a Primary Test Consultant                                                                 |
      | You must define at least two Tabulations - one for the Test Consultant and one that can be Published |

  @TC-INT-087 @regression
  Scenario: Create scheme rejects an identifier in the wrong format
    When the user goes to "/Scheme/Create"
    And the user fills "Identifier" with "ABC"
    And the user presses "Save"
    Then the form shows the error "Identifier must be in the format PT0000 or 0000"

  @TC-INT-088 @regression
  Scenario: Create group address rejects a telephone number with letters
    When the user goes to "/GroupAddress/Create"
    And the user fills "Telephone" with "abc"
    And the user presses "Save"
    Then the form shows the error "Telephone contains characters that are not allowed"

  @TC-INT-090 @regression @write
  Scenario: A country can be added, saved and removed
    When the user stages a new country with a unique name
    Then the staged country is listed with edit and remove actions
    When the user saves the staged changes
    Then the user is told that the countries were saved
    And the country is listed in the country list
    When the user removes that country and saves
    Then the country is not listed in the country list

  @TC-INT-091 @regression @write
  Scenario: A staged country is discarded when the user cancels
    When the user stages a new country with a unique name
    And the user discards the staged changes
    Then the country is not listed in the country list

  @TC-INT-092 @regression @write
  Scenario: A staged viewer is discarded when the user cancels
    When the user stages a viewer with a unique name and email
    Then the staged viewer is listed
    When the user discards the staged changes
    Then the viewer is not listed in the viewer list

  @TC-INT-093 @regression @write
  Scenario Outline: A scheme administration item can be added, kept when removal is declined, and removed
    When the user adds an item with a unique name to the list at "<path>" using the field "<field>"
    Then the item is listed in its list
    When the user starts removing the item
    Then the user is asked to confirm the removal
    When the user declines the removal
    Then the item is listed in its list
    When the user starts removing the item
    And the user confirms the removal
    Then the item is not listed in its list

    Examples:
      | path                           | field                    |
      | /SchemeAdmin/CategoryItemType  | New category name        |
      | /SchemeAdmin/TestType          | New test type name       |
      | /SchemeAdmin/CriterionItemType | New criterion item name  |

