import { BasePage } from './base.page.js'
import { participantForm } from '../content/site.js'

/** ProficiencyTestingExternalWeb participant details form. */
export class ExternalParticipantPage extends BasePage {
  /** @param {string} name id prefix, e.g. ContactNameMaterialTextBox */
  textField(name) {
    return this.page.locator(`#ctl00_Content_${name}_TextBoxField`) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
  }

  get countryAnchor() { // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    return this.page.locator('#ctl00_Content_CountryMaterialDropDown_AnchorElement') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
  }

  /** @param {string} country */
  countryOption(country) {
    return this.page.locator('#ctl00_Content_CountryMaterialDropDown_SelectContainer [data-value]').filter({ hasText: country }).first() // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
  }

  get updateButton() { // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx:109
    return this.page.getByRole('button', { name: participantForm.update, exact: true }) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx:109
  }

  /** @param {string} runId */
  async fillRequiredText(runId) { // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.textField('ContactNameMaterialTextBox').fill('Test Contact') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.textField('OrganisationNameMaterialTextbox').fill(`E2E Org ${runId}`) // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.textField('Address1MaterialTextbox').fill('1 Test Street') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.textField('Address2MaterialTextbox').fill('Test Town') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.textField('TelephoneMaterialTextbox').fill('02081234567') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.textField('EmailMaterialTextbox').fill('test.contact@example.com') // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
  }

  /** @param {string} country */
  async chooseCountry(country) { // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
    await this.countryAnchor.click()
    await this.countryOption(country).click()
  }
}
