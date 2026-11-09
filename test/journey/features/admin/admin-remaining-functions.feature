Feature: Remaining admin functions

@role:admin @feature:admin-remaining-functions @TC-137 @ui
Scenario Outline: A customer's Participants and Contracts lists open from the Customers list
  Given an admin opens the "customers" admin page
  When they select the list link "<link>"
  Then the browser is on "<route>" without a server error

  Examples:
    | link         | route                                | heading      |
    | Participants | /Contracts Admin/ParticipantList.aspx | Participants |
    | Contracts    | /Contracts Admin/ContractList.aspx    | Contracts    |

@role:admin @feature:admin-remaining-functions @TC-138 @ui
Scenario Outline: The customer pages link to each other
  Given an admin opens the "customers" admin page
  When they select the list link "Participants"
  And they press the button "<button>"
  Then the browser is on "<route>" without a server error

  Examples:
    | button                | route                              | heading   |
    | Go to Contracts Page  | /Contracts Admin/ContractList.aspx | Contracts |
    | Go to Customer Details | /Contracts Admin/Customer.aspx | Customers |

@role:admin @feature:admin-remaining-functions @TC-139 @ui
Scenario: Scheme History opens from the Schemes list
  Given an admin opens the "schemes" admin page
  When they select the list link "View"
  Then the browser is on "/Scheme Admin/SchemeHistory.aspx" without a server error

@manual @role:admin @roles @feature:admin-remaining-functions @TC-140 @ui @creates-data
Scenario: Invoice Generation shows its Generate Invoices button for an admin with the role
  Given the signed-in admin has only the Admin role
  When they tick the role "Generate Invoices" for themselves
  And they open Home and the "Manage Contracts" section
  And they select the menu item "Invoice Generation"
  Then the page shows the button "Generate Invoices"

@role:admin @feature:admin-remaining-functions @TC-141 @ui @creates-data
Scenario: A new customer with every required field is saved
  Given an admin opens the create customer page
  When they fill every required customer field with the name "E2E Customer"
  And they save the customer
  Then the customer is saved and the Participants and Contracts buttons appear

@role:admin @feature:admin-remaining-functions @TC-142 @ui @creates-data
Scenario: Printing a group address label is answered by the page
  Given an admin opens the "groupAddressLabels" admin page
  When they print the first group address label
  Then the label print is answered

