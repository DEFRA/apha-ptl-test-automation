@feature:internal-navigation @role:internal
Feature: Internal site navigation
  A signed-in internal user can reach every page their roles allow from the Home page.
  Source: Navigation/SideNavigationProvider.cs, Authorization/PtlPolicies.cs

  @TC-INT-010 @smoke
  Scenario: Internal user sees the home page after signing in
    Given a signed-in internal user
    Then the internal home page greets the user
    And the header shows who is signed in

  @TC-INT-011 @regression
  Scenario: Every side navigation link reachable from Home opens a working page
    Given a signed-in internal user
    When the user follows every side navigation link reachable from home
    Then every visited page loads without an error

  @TC-INT-012 @regression
  Scenario Outline: Internal page opens with its heading or is refused for an account without the role
    Given a signed-in internal user
    When the user opens the internal page with path "<path>"
    Then the page shows its heading, or refuses an account without the role

    Examples:
      | path |
      | /Home/Index |
      | /Search/Index |
      | /Contract/ManageContracts |
      | /Customer/Index |
      | /Customer/Create |
      | /Customer/ReviewPendingCustomerUpdates |
      | /Participant/ReviewPendingParticipantUpdates |
      | /Contract/ReviewPendingOrders |
      | /Contract/Exports |
      | /Contract/ImportPermits |
      | /Contract/RenewContracts |
      | /GroupAddress/Index |
      | /GroupAddress/Create |
      | /Invoice/Index |
      | /Scheme/ManageSchemes |
      | /Scheme/Index |
      | /Scheme/Search |
      | /Scheme/PrintableSchemes |
      | /Scheme/Create |
      | /SchemeAdmin/CategoryItemType |
      | /SchemeAdmin/TestType |
      | /SchemeAdmin/CriterionItemType |
      | /SchemeAdmin/TestResultItemType |
      | /SchemeAdmin/TestMethodItemType |
      | /SystemAdministration/Index |
      | /SystemAdministration/ManageUserRoles |
      | /SystemAdministration/CreateUser |
      | /SystemAdministration/RemoveUser |
      | /SystemAdministration/InternalTestConsultantDepartment |
      | /SystemAdministration/ExternalTestConsultantManagement |
      | /SystemAdministration/ViewerManagement |
      | /SystemAdministration/CountryManagement |
      | /SystemAdministration/ExternalSiteManagement |
      | /SystemAdministration/AdministrationCharge |
      | /SystemAdministration/WeightedPricingPlan |
      | /SystemAdministration/PostagePricingPlan |
      | /Distribution/Index |
      | /Distribution/Search |
      | /Test%20Consultant |
      | /Assessor |
      | /Results%20Sign-off |

