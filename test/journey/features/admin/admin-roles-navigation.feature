Feature: Navigation menus and the roles of the signed-in admin

@manual @role:admin @roles @feature:admin-roles-navigation @TC-122 @ui @creates-data
Scenario: Ticking Generate Invoices shows Invoice Generation in Manage Contracts
  Given the signed-in admin has only the Admin role
  When they tick the role "Generate Invoices" for themselves
  And they open Home and the "Manage Contracts" section
  Then the section menu lists "Customers;Search;Group Addresses;Exports;Invoice Generation"
  When they select the menu item "Invoice Generation"
  Then the page opens at "/Contracts Admin/InvoiceGeneration.aspx" with the heading "Invoice Generation"

@manual @role:admin @roles @feature:admin-roles-navigation @TC-123 @ui @creates-data
Scenario: Unticking Generate Invoices hides Invoice Generation again
  Given the signed-in admin has only the Admin role
  When they tick the role "Generate Invoices" for themselves
  And they untick the role "Generate Invoices" for themselves
  And they open Home and the "Manage Contracts" section
  Then the section menu lists "Customers;Search;Group Addresses;Exports"

@manual @role:admin @roles @feature:admin-roles-navigation @TC-124 @ui @creates-data
Scenario Outline: Ticking one more role leaves every section menu unchanged
  Given the signed-in admin has only the Admin role
  When they tick the role "<role>" for themselves
  Then every section menu still lists its items

  Examples:
    | role |
    | Contracts Admin |
    | Scheme Admin |
    | Scheduling |
    | Internal User |
    | Test Consultant |
    | Assessor |
    | Results Sign-off |
    | Support |
    | Override Schemes |

