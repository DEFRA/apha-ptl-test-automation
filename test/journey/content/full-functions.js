/** Remaining admin pages and values used by the full-function scenarios. */
export const userAdmin = {
  deleteRoute: '/Admin/UserDelete.aspx', // source: app/ProficiencyTestingWeb/Admin/UserDelete.aspx
  searchBox: 'TextboxSearch', searchButton: 'Button_Search', // source: probe 2026-11-02 /Admin/UserCreate.aspx
  userList: 'DropDownList_Users', department: 'TxtDept', create: 'Button_CreateUser', remove: 'Button_DeleteUser', // source: probe 2026-11-03 /Admin/UserCreate.aspx buttons
  directoryUser: process.env.E2E_DIRECTORY_USER ?? 'e2e', // source: env E2E_DIRECTORY_USER, set to a real directory id or name on the target environment
  department_value: 'E2E Department' // source: synthetic value
}

export const schemeCreate = {
  createLink: 'Create Scheme for Current Year', // source: probe 2026-11-03 /Scheme Admin/SchemeList.aspx links
  fields: { TextboxIdentifier: 'RUN', TextboxSampleVolume: '1', TextboxCustomsDescription: 'E2E sample' }, // source: required validators in app/ProficiencyTestingWeb/Scheme Admin/Scheme.aspx:137,384,493
  save: 'ButtonSave1' // source: app/ProficiencyTestingWeb/Scheme Admin/Scheme.aspx:531 (Save of the details tab)
}

export const customerNotes = { box: 'TextboxNotes', save: 'ButtonSave' } // source: app/ProficiencyTestingWeb/Contracts Admin/Customer.aspx:301,323

export const pricingRenew = {
  weighted: { renew: 'a:has-text("Renew pricing plan")', year: 'select[id$=ddlYear]' }, // source: probe 2026-11-03 /Admin/WeightedPricingPlan.aspx
  postage: { renew: 'input[id$=btnRenew]', year: 'select[id$=ddlYear]' } // source: probe 2026-11-03 /Admin/PostagePricingPlan.aspx
}

