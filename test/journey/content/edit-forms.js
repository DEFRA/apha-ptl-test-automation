/** Edit forms of existing records and the extra search targets used by the edit-form scenarios. */
export const editForms = {
  save: 'ButtonSave', // source: Customer.aspx:323, Participant.aspx:114, Contract.aspx:161, Scheme.aspx
  viewers: { possible: 'ListBoxPossibleViewers', selected: 'ListBoxSelectedViewers', add: 'BtnAdd', remove: 'BtnRemove', save: 'BtnSave' }, // source: probe 2026-11-03 ParticipantViewers.aspx
  customer: { copy: 'ButtonCopyDetails', contactName: 'TextboxContactName', invoiceName: 'TextboxInvoiceName', contactEmail: 'TextboxEmail', invoiceEmail: 'TextboxInvoiceEmail', active: 'CheckBoxIsActive', inactiveDate: 'TextboxInactiveDate' }, // source: Customer.aspx:95,104,132,198,210,216,282
  tcDepartment: { statusLinks: ['Active', 'Inactive'] }, // source: probe 2026-11-03 /Admin/TCDepartment.aspx Status column
  externalSite: { route: '/Admin/EditMessageOnWebsite.aspx', save: 'ButtonSave' } // source: app/ProficiencyTestingWeb/Admin/EditMessageOnWebsite.aspx
}

export const moreSearchTargets = { // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  customerAccount: { box: 'TextboxSearchAccountNumber', button: 'ButtonSearchCustomer' }, // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  customerName: { box: 'TextboxSearchCustomerName', button: 'ButtonSearchCustomer' }, // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  customerContact: { box: 'TextboxSearchCustomerContactName', button: 'ButtonSearchCustomer' }, // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  customerOrganisation: { box: 'TextboxSearchCustomerOrganisation', button: 'ButtonSearchCustomer' }, // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  participantLabCode: { box: 'TextboxSearchLabCode', button: 'ButtonSearchParticipant' }, // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  participantLabName: { box: 'TextboxSearchLabName', button: 'ButtonSearchParticipant' }, // source: probe 2026-11-03 /Contracts Admin/Search.aspx
  participantContact: { box: 'TextboxSearchContactName', button: 'ButtonSearchParticipant' } // source: probe 2026-11-03 /Contracts Admin/Search.aspx
}
