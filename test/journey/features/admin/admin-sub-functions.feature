Feature: Roles, scheme tabs, pending orders, import permit and consultant edits

@manual @role:admin @roles @feature:admin-sub-functions @TC-173 @ui @creates-data
Scenario Outline: Unticking one role for dt2\ns000134 leaves the menus and sub menus as expected
  Given the signed-in admin has every optional role ticked
  When they untick the role "<role>" for themselves
  Then every section menu lists its items plus "<extra>"
  When they open the page "<route>"
  Then access to the page is "<outcome>"
  And the sub menu pages of "<section>" are "<sectionOutcome>"
  And the sub menu pages of "System Administration" are "allowed"

  Examples:
    | role              | extra              | route                                     | outcome | section         | sectionOutcome |
    | Contracts Admin   | Invoice Generation | /Contracts Admin/CustomerList.aspx        | denied  | Manage Contracts | denied        |
    | Scheme Admin      | Invoice Generation | /Scheme Admin/SchemeList.aspx             | denied  | Manage Schemes  | denied         |
    | Scheduling        | Invoice Generation | /Scheduling/Tabulations.aspx              | denied  | Distributions   | allowed        |
    | Internal User     | Invoice Generation | /Internal User/PreparationSheet.aspx      | denied  | Distributions   | allowed        |
    | Test Consultant   | Invoice Generation | /Test Consultant/MenuTestConsultants.aspx | denied  | Distributions   | allowed        |
    | Assessor          | Invoice Generation | /Assessor/MenuAssessor.aspx               | denied  | Distributions   | allowed        |
    | Results Sign-off  | Invoice Generation | /Results Sign-off/SignOff.aspx            | denied  | Distributions   | allowed        |
    | Support           | Invoice Generation | /Home.aspx                                | allowed | Distributions   | allowed        |
    | Generate Invoices |                    | /Contracts Admin/InvoiceGeneration.aspx   | denied  | Manage Schemes  | allowed        |
    | Override Schemes  | Invoice Generation | /Home.aspx                                | allowed | Manage Schemes  | allowed        |

@manual @role:admin @roles @feature:admin-sub-functions @TC-178 @ui @creates-data
Scenario Outline: Ticking one role for dt2\ns000134 gives access to its menus and sub menus
  Given the signed-in admin has only the Admin role
  When they tick the role "<role>" for themselves
  Then every section menu lists its items plus "<extra>"
  When they open the page "<route>"
  Then access to the page is "allowed"
  And the sub menu pages of "<section>" are "allowed"
  And the sub menu pages of "System Administration" are "allowed"

  Examples:
    | role              | extra              | route                                     | section          |
    | Contracts Admin   |                    | /Contracts Admin/CustomerList.aspx        | Manage Contracts |
    | Scheme Admin      |                    | /Scheme Admin/SchemeList.aspx             | Manage Schemes   |
    | Scheduling        |                    | /Scheduling/Tabulations.aspx              | Distributions    |
    | Internal User     |                    | /Internal User/PreparationSheet.aspx      | Distributions    |
    | Test Consultant   |                    | /Test Consultant/MenuTestConsultants.aspx | Distributions    |
    | Assessor          |                    | /Assessor/MenuAssessor.aspx               | Distributions    |
    | Results Sign-off  |                    | /Results Sign-off/SignOff.aspx            | Distributions    |
    | Support           |                    | /Home.aspx                                | Distributions    |
    | Generate Invoices | Invoice Generation | /Contracts Admin/InvoiceGeneration.aspx   | Manage Contracts |
    | Override Schemes  |                    | /Home.aspx                                | Manage Schemes   |

@role:admin @feature:admin-sub-functions @TC-174 @ui
Scenario Outline: Each tab of a scheme opens without an error
  Given an admin opens the "schemes" admin page
  When they select the list link "Details"
  And they select the scheme tab "<tab>"
  Then no admin server error page is shown

  Examples:
    | tab                     |
    | Details                 |
    | Tests                   |
    | Distribution Level Data |
    | Results Tabulations     |
    | Test consultants        |

@role:admin @feature:admin-sub-functions @TC-175 @ui
Scenario: A pending order opens from Review Pending Orders
  Given an admin opens the "customers" admin page
  When they select the list link "Review Pending Orders"
  And they select the list link "Details"
  Then the browser is on "/Contracts Admin/PendingContractOrder.aspx" without a server error

@role:admin @feature:admin-sub-functions @TC-176 @ui
Scenario: Import Permit opens from a contract and Cancel returns to the contract list
  Given an admin opens the "customers" admin page
  When they select the list link "Contracts"
  And they select the list link "Import Permit(s)"
  Then the browser is on "/Contracts Admin/ImportPermit.aspx" without a server error
  And the page shows the button "Save"
  And the page shows the button "Apply"
  When they press the button "Cancel"
  Then the browser is on "/Contracts Admin/ContractList.aspx" without a server error

@role:admin @feature:admin-sub-functions @TC-177 @ui @creates-data
Scenario Outline: A field of an external test consultant is edited and kept
  Given an admin opens the editable list "externalTCs"
  When they add the record "E2E Consultant" to "externalTCs"
  And they change the "<field>" of the record "E2E Consultant" on "externalTCs" to "<value>"
  Then the record "E2E Consultant" on "externalTCs" shows "<value>"

  Examples:
    | field      | value                    |
    | Department | E2E Changed Department   |
    | Email      | e2e.changed@example.com  |

