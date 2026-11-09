Feature: Admin customer and scheme lists

@role:admin @feature:admin-customer-scheme-lists @TC-063 @ui @smoke
Scenario: Customers list shows its columns, links and status filter options
  Given an admin opens the "customers" admin page
  Then the customers list shows its columns, links and filter options

@role:admin @feature:admin-customer-scheme-lists @TC-064 @ui
Scenario: Filtering the Customers list by Inactive Only and All keeps the page
  Given an admin opens the "customers" admin page
  When they filter customers by "Inactive Only"
  Then the "customers" admin page is shown
  And no admin server error page is shown
  When they filter customers by "All"
  Then the "customers" admin page is shown
  And the customers table has its columns and at least one row

@role:admin @feature:admin-customer-scheme-lists @TC-065 @ui
Scenario: Review Pending Customer Updates link opens its page from Customers
  Given an admin opens the "customers" admin page
  When they select the list link "Review Pending Customer Updates"
  Then the "pendingCustomerUpdates" admin page is shown
  And no admin server error page is shown

@role:admin @feature:admin-customer-scheme-lists @TC-066 @ui
Scenario: Schemes list shows its columns and links
  Given an admin opens the "schemes" admin page
  Then the schemes list shows its columns and links
  And no admin server error page is shown

@role:admin @feature:admin-customer-scheme-lists @TC-067 @ui
Scenario: Schemes list shows the seeded PT0001 African Horse Sickness row
  Given an admin opens the "schemes" admin page
  Then the seeded scheme row is shown
  And no admin server error page is shown

@role:admin @feature:admin-customer-scheme-lists @TC-068 @ui
Scenario: Printable Schemes link opens without a server error
  Given an admin opens the "schemes" admin page
  When they select the list link "Printable Schemes"
  Then no admin server error page is shown
  Given an admin returns to the schemes list
  Then the "schemes" admin page is shown
