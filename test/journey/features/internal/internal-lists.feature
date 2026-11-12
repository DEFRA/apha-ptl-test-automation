@feature:internal-lists @role:internal
Feature: Internal list pages, selectors and searches
  Read-only checks of list columns, year selectors, paging and searches.
  Source: Features/*/Views/Index.cshtml and live probe (docs/internal/discovery/pages.json)

  @TC-INT-070 @regression
  Scenario Outline: List page shows the expected columns
    When the user goes to "<path>"
    Then the first table has the columns "<columns>"

    Examples:
      | path                                                   | columns                                                      |
      | /Customer/Index                                        | QAL Number,Name,Organisation,Status,Details,Participants,Contracts |
      | /GroupAddress/Index                                    | Identifier,Address line 1,Details                            |
      | /Scheme/Index                                          | Identifier,Name,Current Year,Next Year,History               |
      | /Scheme/PrintableSchemes                               | Identifier,Name,Current Year,Next Year                       |
      | /SchemeAdmin/CategoryItemType                          | Category item type name,No longer in use,Actions             |
      | /SchemeAdmin/TestType                                  | Test type name,No longer in use,Actions                      |
      | /SchemeAdmin/CriterionItemType                         | Criterion item type name,No longer in use,Actions            |
      | /SchemeAdmin/TestResultItemType                        | Test result item name,Return type,No longer in use,Actions   |
      | /SchemeAdmin/TestMethodItemType                        | Test method item name,Return type,No longer in use,Actions   |
      | /SystemAdministration/InternalTestConsultantDepartment | Username,Name,Department,Inactive Date,Status,Actions        |
      | /SystemAdministration/ExternalTestConsultantManagement | Name,Department,Email,Inactive Date,Status,Actions,Login Instructions |
      | /SystemAdministration/ViewerManagement                 | Name,Email,Actions,Login Instructions                        |
      | /SystemAdministration/CountryManagement                | Name,Country Type,Actions                                    |
      | /SystemAdministration/WeightedPricingPlan              | No. Per Year,Weighted pricing %,Cum. Total                   |
      | /SystemAdministration/PostagePricingPlan               | Postage Type,UK,EU,Non-EU,Actions                            |
      | /Distribution/Index                                    | Month,Scheduling,Preparation,Packaging,Results,Tabulations   |

  @TC-INT-071 @regression
  Scenario Outline: Year selector changes the data shown without an error
    When the user goes to "<path>"
    And the user views the second option of the selector "<selector>"
    Then the page still has the heading "<heading>"
    And the selector "<selector>" shows the chosen option
    And the page shows no error summary

    Examples:
      | path                                      | selector                 | heading               |
      | /Distribution/Index                       | Year                     | Distributions         |
      | /SystemAdministration/WeightedPricingPlan | Select a financial year: | Weighted Pricing Plan |
      | /SystemAdministration/PostagePricingPlan  | Select a financial year: | Postage Pricing Plan  |
      | /SchemeAdmin/CategoryItemType             | Select Year to Edit:     | Category Items        |
      | /SchemeAdmin/TestType                     | Select Year to Edit:     | Test Types            |
      | /SchemeAdmin/CriterionItemType            | Select Year to Edit:     | Criterion Items       |

  @TC-INT-072 @regression
  Scenario Outline: Items per page limits the rows shown
    When the user goes to "<path>"
    And the user sets items per page to <size>
    Then the first table shows at most <size> rows

    Examples:
      | path                | size |
      | /Customer/Index     | 10   |
      | /Customer/Index     | 15   |
      | /GroupAddress/Index | 10   |
      | /Scheme/Index       | 10   |

  @TC-INT-073 @regression
  Scenario Outline: The next page of a long list shows more rows
    When the user goes to "<path>"
    And the user goes to the next page of results
    Then the address shows page 2

    Examples:
      | path                |
      | /Customer/Index     |
      | /GroupAddress/Index |
      | /Scheme/Index       |

  @TC-INT-074 @regression
  Scenario Outline: A scheme is found by part of its name in any letter case
    When the user remembers the name of the first scheme in the list
    And the user searches schemes by <style> text of that name
    Then the scheme search results include that scheme

    Examples:
      | style     |
      | exact     |
      | partial   |
      | uppercase |
      | lowercase |

  @TC-INT-075 @regression
  Scenario Outline: Scheme and distribution searches with unmatched or unusual text do not fail
    When the user goes to "<path>"
    And the user fills "<field>" with "<text>"
    And the user presses "Search"
    Then the page still has the heading "Search"
    And the page shows no error summary

    Examples:
      | path             | field               | text                  |
      | /Scheme/Search   | Scheme Name         | zzzz-no-such-scheme   |
      | /Scheme/Search   | Scheme Name         | %                     |
      | /Scheme/Search   | Scheme Name         | O'Neil                |
      | /Distribution/Search | Distribution Number | zzzz-no-such-number |
      | /Distribution/Search | Distribution Number | %                   |

  @TC-INT-076 @regression
  Scenario: A blank distribution search does not fail
    When the user goes to "/Distribution/Search"
    And the user presses "Search"
    Then the page still has the heading "Search"
    And the page shows no error summary
