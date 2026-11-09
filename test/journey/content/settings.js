/** Admin settings pages whose values can be changed and restored, keyed by meaning. */
export const settingsPages = {
  externalSite: { // source: app/ProficiencyTestingWeb/Admin/EditMessageOnWebsite.aspx
    kind: 'form', route: '/Admin/EditMessageOnWebsite.aspx', heading: 'External Site Management', // source: app/ProficiencyTestingWeb/Admin/EditMessageOnWebsite.aspx
    fields: { Email: 'EmailTextBox' }, commit: 'ButtonSave', cancel: 'ButtonCancel' // source: app/ProficiencyTestingWeb/Admin/EditMessageOnWebsite.aspx (ButtonSave, ButtonCancel)
  },
  charges: { // source: app/ProficiencyTestingWeb/Admin/AdministrationChargeCurrency.aspx
    kind: 'grid', route: '/Admin/AdministrationChargeCurrency.aspx', heading: 'Administration Charges', // source: app/ProficiencyTestingWeb/Admin/AdministrationChargeCurrency.aspx
    fields: { Euro: 'Euro', GBP: 'GBP' }, commit: 'ButtonSubmit' // source: probe 2026-11-03 column headers (the currency symbol is omitted); ButtonSubmit posts the changed boxes (AdministrationChargeCurrency.aspx.vb:133)
  },
  postage: { // source: app/ProficiencyTestingWeb/Admin/PostagePricingPlan.aspx
    kind: 'rowEdit', route: '/Admin/PostagePricingPlan.aspx', heading: 'Postage Pricing Plan', // source: app/ProficiencyTestingWeb/Admin/PostagePricingPlan.aspx
    fields: { 'UK price': 'TxtUKPrice', 'EU price': 'TxtEUPrice', 'Non-EU price': 'TxtNonEUPrice' } // source: app/ProficiencyTestingWeb/Admin/PostagePricingPlan.aspx
  },
  tcDepartment: { // source: app/ProficiencyTestingWeb/Admin/TCDepartment.aspx
    kind: 'rowEdit', route: '/Admin/TCDepartment.aspx', heading: 'Internal Test Consultant Department', // source: app/ProficiencyTestingWeb/Admin/TCDepartment.aspx
    fields: { Department: 'TxtDepartment' }, pageSave: 'ButtonSubmit' // source: app/ProficiencyTestingWeb/Admin/TCDepartment.aspx (ButtonSubmit_Click)
  }
}
