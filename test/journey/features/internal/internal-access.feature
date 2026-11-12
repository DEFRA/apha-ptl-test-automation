@feature:internal-access @role:anonymous
Feature: Internal site access
  The internal site signs users in through Microsoft Entra ID and refuses pages outside a user's roles.
  Source: Program.cs, Features/Account/AccountController.cs, Authorization/PtlPolicies.cs

  @TC-INT-001 @smoke
  Scenario Outline: Visitor who is not signed in is sent to Microsoft sign-in
    Given an internal visitor who is not signed in
    When the visitor opens the internal page "<path>"
    Then the visitor is sent to the Microsoft sign-in page

    Examples:
      | path |
      | /Home/Index |
      | /Customer/Index |
      | /Search/Index |
      | /SystemAdministration/Index |
      | /Distribution/Index |

  @TC-INT-002 @regression
  Scenario Outline: Account pages that need no sign-in are shown
    Given an internal visitor who is not signed in
    When the visitor opens the internal <page> page
    Then the internal <page> page is shown

    Examples:
      | page           |
      | signedOut      |
      | sessionExpired |
      | notPermitted   |

  @TC-INT-003 @regression
  Scenario: Access denied page answers with status 403
    Given an internal visitor who is not signed in
    When the visitor opens the internal accessDenied page
    Then the response status is 403
    And the internal accessDenied page is shown
