@feature:internal-search @role:internal
Feature: Internal customer and participant search
  Contracts Admin staff search customers and participants. Every criterion is optional.
  Source: Features/Search/SearchController.cs, SearchViewModel.cs, Views/Index.cshtml

  @TC-INT-030 @smoke
  Scenario: Search page offers the Customers and Participants tabs
    When the user opens the internal search page
    Then the internal search page is shown
    And the search page offers the Customers and Participants tabs

  @TC-INT-031 @regression
  Scenario: Searching customers with no criteria shows the results panel
    When the user opens the internal search page
    And the user searches customers with no criteria
    Then the search results panel is shown

  @TC-INT-032 @regression
  Scenario Outline: A customer is found by part of its name, in any letter case
    When the user opens the internal customer list
    And the customer list has at least one row to work with
    When the user opens the internal search page
    And the user searches customers by the name of the seed customer using <style> text
    Then the customer search results include the seed customer

    Examples:
      | style     |
      | exact     |
      | partial   |
      | uppercase |
      | lowercase |

  @TC-INT-033 @regression
  Scenario Outline: Customer search with unmatched or unusual text reports no error page
    When the user opens the internal search page
    And the user searches customers by name "<text>"
    Then the search page does not show an error page

    Examples:
      | text                  |
      | zzzz-no-such-customer |
      | %                     |
      | O'Neil                |
      | <b>x</b>              |

  @TC-INT-034 @regression
  Scenario: A customer search with no match says there are no results
    When the user opens the internal search page
    And the user searches customers by name "zzzz-no-such-customer"
    Then the search reports that there are no results

  @TC-INT-035 @regression
  Scenario Outline: Customer search field limits
    When the user opens the internal search page
    Then the <field> search field accepts at most <max> characters

    Examples:
      | field         | max |
      | qalNumber     | 10  |
      | accountNumber | 20  |
      | name          | 50  |

  @TC-INT-036 @regression
  Scenario: Server rejects a customer search with an over-long QAL number
    When the user searches customers using a link with the qalNumber "12345678901"
    Then the search page shows the error "QAL Number must be 10 characters or fewer"

  @TC-INT-037 @regression
  Scenario: Server rejects a participant search with an over-long lab code
    When the user searches participants using a link with the lab code "123456789"
    Then the search page shows the error "Lab Code must be 8 characters or fewer"

  @TC-INT-038 @regression
  Scenario: A participant search with no match says there are no results
    When the user opens the internal search page
    And the user opens the Participants search tab
    And the user searches participants by labName "zzzz-no-such-lab"
    Then the search reports that there are no results
