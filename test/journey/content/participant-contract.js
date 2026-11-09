/** Create Participant and Create Contract forms: id suffixes and synthetic values. */
export const participantCreate = {
  route: '/Contracts Admin/Participant.aspx', // source: app/ProficiencyTestingWeb/Contracts Admin/Participant.aspx.vb:33 (no ParticipantId creates one for the customer in session)
  textFields: { // source: required validators in app/ProficiencyTestingWeb/Contracts Admin/Participant.aspx
    TextboxLabCode: 'LAB', TextboxLabName: 'NAME', TextboxContactName: 'Jane Smith', TextboxOrganisationName: 'E2E Organisation',
    TextboxAddress1: '1 Test Street', TextboxAddress2: 'Testville', TextboxTelephone: '02081234567', TextboxEmail: 'e2e.participant@example.com'
  },
  dropdowns: ['DropDownCountry', 'DropDownLabType'], // source: Participant.aspx:42,88
  save: 'ButtonSave', activeBox: 'CheckBoxIsActive' // source: Participant.aspx:31,114
}

export const contractCreate = {
  route: '/Contracts Admin/Contract.aspx', // source: app/ProficiencyTestingWeb/Contracts Admin/Contract.aspx.vb:29 (no ContractId creates one for the customer in session)
  textFields: { TextboxUTFTNumber: 'RUN' }, // source: Contract.aspx:21 required validator
  dropdowns: ['DropDownYear'], // source: Contract.aspx:37
  save: 'ButtonSave', activeBox: 'CheckBoxIsActive' // source: Contract.aspx:101,161
}

export const signOff = { authorise: 'Authorise', reject: 'Reject' } // source: app/ProficiencyTestingWeb/Results Sign-off/Tabulation.aspx:72-73
