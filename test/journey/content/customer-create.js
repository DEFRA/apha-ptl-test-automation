/** Create Customer form: element id suffixes and synthetic values. */
export const customerCreate = {
  route: '/Contracts Admin/Customer.aspx', // source: probe 2026-11-03 Create Customer link on /Contracts Admin/CustomerList.aspx
  save: 'ButtonSave', // source: app/ProficiencyTestingWeb/Contracts Admin/Customer.aspx:323
  activeBox: 'CheckBoxIsActive', // source: app/ProficiencyTestingWeb/Contracts Admin/Customer.aspx:95
  savedMessage: 'Customer details saved successfully', // source: app/ProficiencyTestingWeb/Contracts Admin/Customer.aspx.vb:243
  textFields: { // source: required validators in app/ProficiencyTestingWeb/Contracts Admin/Customer.aspx.vb:600
    TextboxName: 'NAME',
    TextboxContactName: 'Jane Smith',
    TextboxOrganisationName: 'E2E Organisation',
    TextboxAddress1: '1 Test Street',
    TextboxAddress2: 'Testville',
    TextboxTelephone: '02081234567',
    TextboxEmail: 'e2e.customer@example.com',
    TextboxInvoiceOrganisationName: 'E2E Organisation',
    TextboxInvoiceAddress1: '1 Test Street',
    TextboxInvoiceAddress2: 'Testville',
    TextboxInvoiceEmail: 'e2e.invoice@example.com' // source: probe 2026-11-03 save failed with "The Invoice Email Address supplied for this customer is invalid"
  },
  dropdowns: ['DropDownCustomerType', 'DropDownCountry', 'DropDownInvoiceCountry'] // source: Customer.aspx required dropdown validators
}

export const labelPrint = {
  messages: ['Label sent to Printer', 'Error Printing Label', 'Print Error'], // source: app/ProficiencyTestingWeb/Distributions/GroupAddress.aspx.vb:28-30; Customer.aspx.vb:262,273 and Participant.aspx.vb:117 show Print Error when the printer service fails
  printLink: 'Print' // source: app/ProficiencyTestingWeb/Distributions/GroupAddress.aspx:22
}

