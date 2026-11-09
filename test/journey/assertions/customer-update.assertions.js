import { expect } from '@playwright/test'

export async function expectCustomerFormLocked({ contactName, updateButton }) {
  await expect(contactName).toBeDisabled() // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:371-395
  await expect(updateButton).toBeDisabled() // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:395
}

export async function expectCustomerFormEditable({ contactName }) {
  await expect(contactName).toBeEnabled() // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:128
}

export async function expectContactName({ contactName }, value) {
  await expect(contactName).toHaveValue(value) // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:167-191 (LoadFormFromObject)
}
