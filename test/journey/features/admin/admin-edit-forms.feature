Feature: Edit, validation, search and action coverage for the remaining menu pages

@role:admin @feature:admin-edit-forms @TC-159 @ui @creates-data
Scenario Outline: A field of an existing record is changed, kept after reloading and restored
  Given an admin opens the first "<record>" record for editing
  When they set the field "<field>" to "<value>"
  And they save the record
  Then the field "<field>" shows "<value>" after reloading

  Examples:
    | record      | field                   | value             |
    | customer    | TextboxPostageInfo      | E2E postage RUN   |
    | customer    | TextboxVatNumber        | RUN               |
    | customer    | TextboxTelephone2       | 02081234568       |
    | participant | TextboxComments         | E2E comment RUN   |
    | participant | TextboxEmail2           | e2e.RUN@example.com |
    | participant | TextboxFax              | 02081234569       |
    | contract    | TextboxPurchaseOrderNumber | PO-RUN         |
    | contract    | TextboxContractSignatory   | E2E Signatory  |
    | contract    | TextboxActionsRequired     | E2E action RUN |
    | scheme      | TextboxSampleVolume        | 5              |

@role:admin @feature:admin-edit-forms @TC-160 @ui @negative
Scenario Outline: An invalid value in an existing record blocks the save
  Given an admin opens the first "<record>" record for editing
  When they set the field "<field>" to "<value>"
  And they try to save the record
  Then saving is blocked by validation

  Examples:
    | record      | field                 | value |
    | customer    | TextboxEmail          | x     |
    | customer    | TextboxTelephone      | abc   |
    | customer    | TextboxInvoiceEmail   | x     |
    | participant | TextboxEmail          | x     |
    | participant | TextboxTelephone      | abc   |
    | contract    | TextboxDiscountRate   | abc   |
    | contract    | TextboxCourierPrice   | abc   |
    | contract    | TextboxPostagePrice   | abc   |
    | scheme      | TextboxSampleVolume   |       |

@role:admin @feature:admin-edit-forms @TC-161 @ui
Scenario Outline: A customer search by another field lists matches or none
  Given an admin opens the "contractsSearch" admin page
  When they search "<target>" for "<value>"
  Then the search shows <outcome>

  Examples:
    | target               | value        | outcome      |
    | customerName         | ZZ-NO-SUCH   | no results   |
    | customerAccount      | ZZ-NO-SUCH   | no results   |
    | customerContact      | ZZ-NO-SUCH   | no results   |
    | customerOrganisation | ZZ-NO-SUCH   | no results   |
    | customerName         | E2E          | some results |
    | customerContact      | Jane         | some results |
    | customerOrganisation | E2E          | some results |

@role:admin @feature:admin-edit-forms @TC-162 @ui
Scenario Outline: A participant search by lab code, lab name or contact lists matches or none
  Given an admin opens the "contractsSearch" admin page
  And they open the "Participants" search tab
  When they search "<target>" for "<value>"
  Then the search shows <outcome>

  Examples:
    | target             | value      | outcome      |
    | participantLabCode | ZZ-NOSUCH  | no results   |
    | participantLabName | ZZ-NO-SUCH | no results   |
    | participantContact | ZZ-NO-SUCH | no results   |
    | participantLabName | E2E        | some results |
    | participantContact | Jane       | some results |

@role:admin @feature:admin-edit-forms @TC-163 @ui @creates-data @irreversible
Scenario: A viewer is added to a participant
  Given an admin opens the "customers" admin page
  When they select the list link "Participants"
  And they select the list link "Viewers"
  And they add the first possible viewer to the participant
  Then the participant has one more viewer

@role:admin @feature:admin-edit-forms @TC-164 @ui @creates-data
Scenario: A customer is made inactive and shows its inactive date
  Given an admin has filled the create customer form
  When they save the new customer
  And they untick Active and save the customer
  Then the customer shows an inactive date

@role:admin @feature:admin-edit-forms @TC-165 @ui
Scenario: Copying the contact details fills the invoice details
  Given an admin has filled the create customer form
  When they copy the customer contact details to the invoice details
  Then the invoice email equals the contact email

@role:admin @feature:admin-edit-forms @TC-166 @ui @creates-data
Scenario Outline: An address label is printed from a customer or participant
  Given an admin opens the first "<record>" record for editing
  When they press the button "<button>"
  Then the label print is answered

  Examples:
    | record      | button                       |
    | customer    | Print Contact Address Label  |
    | customer    | Print Invoice Address Label  |
    | participant | Print Address Label          |

@role:admin @feature:admin-edit-forms @TC-167 @ui
Scenario: A contract item opens its View / Edit page
  Given an admin opens the "customers" admin page
  When they select the list link "Contracts"
  And they select the list link "Contract Items"
  And they select the list link "View / Edit"
  Then the browser is on "/Contracts Admin/ParticipantScheme.aspx" without a server error

@role:admin @feature:admin-edit-forms @TC-168 @ui
Scenario: The Renew link of a scheme opens the renewal form
  Given an admin opens the "schemes" admin page
  When they select the list link "Renew"
  Then the browser is on "/Scheme Admin/Scheme.aspx" without a server error

@manual @role:admin @roles @feature:admin-edit-forms @TC-169 @ui @creates-data @irreversible
Scenario Outline: The Invoice Generation page actions are pressed
  Given the signed-in admin has only the Admin role
  When they tick the role "Generate Invoices" for themselves
  And they open Home and the "Manage Contracts" section
  And they select the menu item "Invoice Generation"
  And they press the button "<button>"
  Then no admin server error page is shown

  Examples:
    | button                       |
    | Generate Invoices            |
    | Reset All Invoices (UAT only) |

@role:admin @feature:admin-edit-forms @TC-170 @ui @creates-data
Scenario: Draw tabulation is pressed on a tabulation waiting for sign-off
  Given an admin opens the "resultsSignOff" admin page
  When they open the first tabulation waiting for sign-off
  And they press the button "Draw tabulation"
  Then no admin server error page is shown

@role:admin @feature:admin-edit-forms @TC-171 @ui @creates-data
Scenario: A consultant is made inactive and active again
  Given an admin opens the "tcDepartment" admin page
  When they toggle the first consultant status
  Then the first consultant status has changed

@role:admin @feature:admin-edit-forms @TC-172 @ui @creates-data
Scenario: The two external site messages are changed, kept after reloading and restored
  Given an admin opens the "externalSite" settings page
  When they change both external site messages to unique text
  Then the external site messages keep the new text after reloading


