Feature: Admin navigation menus

@role:admin @feature:admin-navigation @TC-118 @ui
Scenario: Home shows a card for every section
  Given an admin opens the "home" admin page
  Then the home page lists the section cards "System Administration;Manage Contracts;Manage Schemes;Distributions;Test Consultant;Assessor;Results Sign-off"

@role:admin @feature:admin-navigation @TC-119 @ui
Scenario Outline: A section menu lists its items
  Given an admin opens the "home" admin page
  When they open the "<section>" section from Home
  Then the section menu lists "<items>"

  Examples:
    | section | items |
    | System Administration | Manage Roles;Create User;Remove User;Internal Test Consultant Department;Manage External Test Consultants;Manage Viewers;Manage Countries;External Site Management;Administration Charges;Weighted Pricing Plan;Postage Pricing Plan |
    | Manage Contracts | Customers;Search;Group Addresses;Exports |
    | Manage Schemes | Schemes;Search;Test Types;Test Result Items;Test Method Items;Category Items;Criterion Items |
    | Distributions | Participant Address Labels;Group Address Labels;Search |

@role:admin @feature:admin-navigation @TC-120 @ui
Scenario Outline: Home to section to menu item opens the page
  Given an admin opens the "home" admin page
  When they open the "<section>" section from Home
  And they select the menu item "<item>"
  Then the page opens at "<route>" with the heading "<heading>"
  And no admin server error page is shown

  Examples:
    | section | item | route | heading |
    | System Administration | Manage Roles | /Admin/UserRoles.aspx | Manage Roles |
    | System Administration | Create User | /Admin/UserCreate.aspx | Create User |
    | System Administration | Remove User | /Admin/UserDelete.aspx | Remove User |
    | System Administration | Internal Test Consultant Department | /Admin/TCDepartment.aspx | Internal Test Consultant Department |
    | System Administration | Manage External Test Consultants | /Admin/ManageExternalTCs.aspx | Manage External Test Consultants |
    | System Administration | Manage Viewers | /Admin/ManageViewers.aspx | Manage Viewers |
    | System Administration | Manage Countries | /Admin/ManageCountries.aspx | Manage Countries |
    | System Administration | External Site Management | /Admin/EditMessageOnWebsite.aspx | External Site Management |
    | System Administration | Administration Charges | /Admin/AdministrationChargeCurrency.aspx | Administration Charges |
    | System Administration | Weighted Pricing Plan | /Admin/WeightedPricingPlan.aspx | Weighted Pricing Plan |
    | System Administration | Postage Pricing Plan | /Admin/PostagePricingPlan.aspx | Postage Pricing Plan |
    | Manage Contracts | Customers | /Contracts Admin/CustomerList.aspx | Customers |
    | Manage Contracts | Search | /Contracts Admin/Search.aspx | Search |
    | Manage Contracts | Group Addresses | /Contracts Admin/GroupAddressList.aspx | Group Addresses |
    | Manage Contracts | Exports | /Contracts Admin/ExportMenu.aspx | Exports |
    | Manage Schemes | Schemes | /Scheme Admin/SchemeList.aspx | Schemes |
    | Manage Schemes | Search | /Scheme Admin/Search.aspx | Search |
    | Manage Schemes | Test Types | /Scheme Admin/TestTypeList.aspx | Test Types |
    | Manage Schemes | Test Result Items | /Scheme Admin/TestResultItemTypeList.aspx | Test Result Items |
    | Manage Schemes | Test Method Items | /Scheme Admin/TestMethodItemTypeList.aspx | Test Method Items |
    | Manage Schemes | Category Items | /Scheme Admin/CategoryItemTypeList.aspx | Category Items |
    | Manage Schemes | Criterion Items | /Scheme Admin/CriterionItemTypeList.aspx | Criterion Items |
    | Distributions | Participant Address Labels | /Distributions/ParticipantAddress.aspx | Participant Address Labels |
    | Distributions | Group Address Labels | /Distributions/GroupAddress.aspx | Group Address Labels |
    | Distributions | Search | /Distributions/Search.aspx | Search |

@role:admin @feature:admin-navigation @TC-121 @ui
Scenario: Home opens Results Sign-off
  Given an admin opens the "home" admin page
  When they open the "Results Sign-off" section from Home
  Then the page opens at "/Results Sign-off/SignOff.aspx" with the heading "Results Sign-off"
  And no admin server error page is shown
