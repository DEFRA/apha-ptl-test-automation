import { byProfile } from '../support/profiles.js'
import { moreSearchTargets } from './edit-forms.js'

/** Pages of ProficiencyTestingExternalWeb (http://localhost:1688), keyed by meaning. */
export const externalPages = {
  home: { route: '/Home.aspx', heading: byProfile({ legacy: 'VETQAS Proficiency Testing', gds: 'VETQAS Proficiency Testing' }) }, // source: docs/discovery/crawl.json /Home.aspx
  information: { route: '/ViewInformation.aspx', heading: byProfile({ legacy: 'Information', gds: 'Information' }) }, // source: docs/discovery/crawl.json /ViewInformation.aspx
  help: { route: '/Help.aspx', heading: byProfile({ legacy: 'Help', gds: 'Help' }) }, // source: docs/discovery/crawl.json edgeLinks Help
  about: { route: '/About.aspx', heading: byProfile({ legacy: 'About', gds: 'About' }) }, // source: docs/discovery/crawl.json edgeLinks System Information
  accessibility: { route: '/AccessibilityStatement.aspx', heading: byProfile({ legacy: 'Accessibility statement for the PT\u2011LIMS website', gds: 'Accessibility statement for the PT\u2011LIMS website' }) }, // source: docs/discovery/crawl.json edgeLinks (non-breaking hyphen)
  privacy: { route: '/PrivacyPolicy.aspx', heading: byProfile({ legacy: 'VETQAS Privacy Notice', gds: 'VETQAS Privacy Notice' }) }, // source: docs/discovery/crawl.json edgeLinks Privacy Policy
  myAccount: { route: '/EditParticipantDetails.aspx', heading: byProfile({ legacy: 'My account', gds: 'My account' }) }, // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
  notFound: { route: '/ErrorPageNotFound.aspx', heading: byProfile({ legacy: 'Page not found', gds: 'Page not found' }) }, // source: app/ProficiencyTestingExternalWeb/ErrorPageNotFound.aspx
  genericError: { route: '/ErrorGeneric.aspx', heading: byProfile({ legacy: 'Error', gds: 'Error' }) }, // source: app/ProficiencyTestingExternalWeb/ErrorGeneric.aspx
  userInactive: { route: '/ErrorUserInactive.aspx', heading: byProfile({ legacy: 'Invalid Permissions', gds: 'Invalid Permissions' }) }, // source: app/ProficiencyTestingExternalWeb/ErrorUserInactive.aspx
  schemes: { route: '/SchemeList.aspx', heading: byProfile({ legacy: 'View Schemes', gds: 'View Schemes' }), title: 'Scheme list - Proficiency Testing' }, // source: crawl http://localhost:1688/SchemeList.aspx
  currentDistributions: { route: '/DistributionsCurrent.aspx', heading: byProfile({ legacy: 'Current Distributions', gds: 'Current Distributions' }) }, // source: crawl http://localhost:1688/DistributionsCurrent.aspx
  previousDistributions: { route: '/DistributionsPrevious.aspx', heading: byProfile({ legacy: 'Previous Distributions', gds: 'Previous Distributions' }), searchLabels: ['Distribution Reference', 'Scheme Code', 'Scheme Name'] }, // source: crawl http://localhost:1688/DistributionsPrevious.aspx
  reports: { route: '/Tabulations.aspx', heading: byProfile({ legacy: 'Reports', gds: 'Reports' }), title: 'Tabulations - Proficiency Testing', searchLabels: ['Distribution Reference', 'Scheme Code', 'Scheme Name'] }, // source: crawl http://localhost:1688/Tabulations.aspx
  comments: { route: '/DistributionComments.aspx', heading: byProfile({ legacy: 'Distributions', gds: 'Distributions' }), title: 'Distribution comments - Proficiency Testing', searchLabels: ['Distribution Reference', 'Scheme Name', 'Scheme Code'] } // source: crawl http://localhost:1688/DistributionComments.aspx
}

/** Home cards by meaning; the value is the card's h3 text. */
export const homeCards = {
  viewSchemes: 'View schemes', // source: docs/discovery/crawl.json /Home.aspx headings
  enterResults: 'Enter results', // source: docs/discovery/crawl.json /Home.aspx headings
  viewResults: 'View results', // source: docs/discovery/crawl.json /Home.aspx headings
  viewReports: 'View reports', // source: docs/discovery/crawl.json /Home.aspx headings
  enterComments: 'Enter comments' // source: docs/discovery/crawl.json /Home.aspx headings
}

export const listContent = {
  schemeColumns: ['Scheme Code', 'Scheme Name', 'Participating', 'Current Contract Year'], // source: crawl http://localhost:1688/SchemeList.aspx th
  unknownReference: 'ZZ-NO-SUCH-REF', // source: synthetic value, matches no distribution
  referenceLabel: 'Distribution Reference', // source: crawl http://localhost:1688/Tabulations.aspx labels
  searchButton: 'SEARCH', // source: crawl http://localhost:1688/Tabulations.aspx buttons
  showAllButton: 'SHOW ALL', // source: crawl http://localhost:1688/Tabulations.aspx buttons
  messages: { noCurrentDistributions: 'There are no current distributions to display', noDistributions: 'There are no distributions to display' } // source: crawl http://localhost:1688/DistributionsCurrent.aspx and DistributionsPrevious.aspx
}

export const unknownExternalRoute = '/DoesNotExist.aspx' // source: observed HTTP 404 on 2026-11-02

/** Home page structure. */
export const homeContent = {
  sections: byProfile({ legacy: ['Important', 'Orders', 'Schemes', 'Results', 'Accounts'], gds: ['Important', 'Orders', 'Schemes', 'Results', 'Accounts'] }), // source: docs/discovery/crawl.json /Home.aspx headings
  cards: byProfile({ legacy: ['Create order for current year', 'Create order for next year', 'View schemes', 'Enter results', 'View results', 'View reports', 'Enter comments', 'Edit customer details', 'Edit participant details'], gds: ['Create order for current year', 'Create order for next year', 'View schemes', 'Enter results', 'View results', 'View reports', 'Enter comments', 'Edit customer details', 'Edit participant details'] }), // source: docs/discovery/crawl.json /Home.aspx headings
  loggedInLabel: byProfile({ legacy: 'Logged in as :', gds: 'Logged in as :' }), // source: app/ProficiencyTestingExternalWeb/NavigationBar.ascx
  userName: byProfile({ legacy: 'Local Debug User', gds: 'Local Debug User' }), // source: app/ProficiencyTestingExternalWeb/Utilities/UserPermissions.vb:41
  headerLinks: byProfile({ legacy: ['APHA Science Services', 'User manual', 'My account'], gds: ['APHA Science Services', 'User manual', 'My account'] }), // source: docs/discovery/crawl.json /Home.aspx (accessible name of the User Manual link is 'User manual')
  logOut: byProfile({ legacy: 'Log out', gds: 'Log out' }), // source: docs/discovery/crawl.json /Home.aspx
  links: { information: 'View Information', myAccount: 'My account' } // source: docs/discovery/crawl.json /Home.aspx
}

/** Pages of ProficiencyTestingWeb (http://localhost:1946), keyed by meaning. */
export const adminPages = {
  home: { route: '/home.aspx', heading: 'Home' }, // source: docs/discovery/crawl-admin.json /home.aspx
  systemAdministration: { route: '/Admin/MenuAdmin.aspx', heading: 'System Administration', link: 'System Administration' }, // source: docs/discovery/crawl-admin.json
  manageContracts: { route: '/Contracts Admin/MenuContracts.aspx', heading: 'Manage Contracts', link: 'Manage Contracts' }, // source: docs/discovery/crawl-admin.json
  manageSchemes: { route: '/Scheme Admin/MenuSchemes.aspx', heading: 'Manage Schemes', link: 'Manage Schemes' }, // source: docs/discovery/crawl-admin.json
  distributions: { route: '/Distributions/MenuDistributions.aspx', heading: 'Distributions', link: 'Distributions' }, // source: docs/discovery/crawl-admin.json
  testConsultant: { route: '/Test Consultant/MenuTestConsultants.aspx', heading: 'Test Consultant', link: 'Test Consultant' }, // source: docs/discovery/crawl-admin.json
  assessor: { route: '/Assessor/MenuAssessor.aspx', heading: 'Assessor', link: 'Assessor' }, // source: docs/discovery/crawl-admin.json
  resultsSignOff: { route: '/Results Sign-off/SignOff.aspx', heading: 'Results Sign-off', link: 'Results Sign-off' }, // source: docs/discovery/crawl-admin.json
  customers: { route: '/Contracts Admin/CustomerList.aspx', heading: 'Customers' }, // source: docs/discovery/crawl-admin.json
  contractsSearch: { route: '/Contracts Admin/Search.aspx', heading: 'Search' }, // source: docs/discovery/crawl-admin.json
  groupAddresses: { route: '/Contracts Admin/GroupAddressList.aspx', heading: 'Group Addresses' }, // source: docs/discovery/crawl-admin.json
  exports: { route: '/Contracts Admin/ExportMenu.aspx', heading: 'Exports' }, // source: docs/discovery/crawl-admin.json
  schemes: { route: '/Scheme Admin/SchemeList.aspx', heading: 'Schemes' }, // source: docs/discovery/crawl-admin.json
  schemesSearch: { route: '/Scheme Admin/Search.aspx', heading: 'Search' }, // source: docs/discovery/crawl-admin.json
  testTypes: { route: '/Scheme Admin/TestTypeList.aspx', heading: 'Test Types' }, // source: docs/discovery/crawl-admin.json
  testResultItems: { route: '/Scheme Admin/TestResultItemTypeList.aspx', heading: 'Test Result Items' }, // source: docs/discovery/crawl-admin.json
  testMethodItems: { route: '/Scheme Admin/TestMethodItemTypeList.aspx', heading: 'Test Method Items' }, // source: docs/discovery/crawl-admin.json
  categoryItems: { route: '/Scheme Admin/CategoryItemTypeList.aspx', heading: 'Category Items' }, // source: docs/discovery/crawl-admin.json
  criterionItems: { route: '/Scheme Admin/CriterionItemTypeList.aspx', heading: 'Criterion Items' }, // source: docs/discovery/crawl-admin.json
  participantAddress: { route: '/Distributions/ParticipantAddress.aspx', heading: 'Participant Address Labels' }, // source: docs/discovery/crawl-admin.json
  groupAddressLabels: { route: '/Distributions/GroupAddress.aspx', heading: 'Group Address Labels' }, // source: docs/discovery/crawl-admin.json
  distributionsSearch: { route: '/Distributions/Search.aspx', heading: 'Search' }, // source: docs/discovery/crawl-admin.json
  userRoles: { route: '/Admin/UserRoles.aspx', heading: 'Manage Roles' }, // source: docs/discovery/crawl-admin.json
  userCreate: { route: '/Admin/UserCreate.aspx', heading: 'Create User' }, // source: docs/discovery/crawl-admin.json
  tcDepartment: { route: '/Admin/TCDepartment.aspx', heading: 'Internal Test Consultant Department' }, // source: docs/discovery/crawl-admin.json
  weightedPricing: { route: '/Admin/WeightedPricingPlan.aspx', heading: 'Weighted Pricing Plan' }, // source: docs/discovery/crawl-admin.json
  postagePricing: { route: '/Admin/PostagePricingPlan.aspx', heading: 'Postage Pricing Plan' }, // source: docs/discovery/crawl-admin.json
  groupAddressCreate: { route: '/Contracts Admin/GroupAddress.aspx', heading: 'Create Group Address' }, // source: probe 2026-11-02 and app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx
  groupAddressEdit: { route: '/Contracts Admin/GroupAddress.aspx', heading: 'Edit Group Address' }, // source: probe 2026-11-02 and app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx
  pendingCustomerUpdates: { route: '/Contracts Admin/ReviewPendingCustomerUpdates.aspx', heading: 'Review Pending Customer Updates' }, // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingCustomerUpdates.aspx
  pendingParticipantUpdates: { route: '/Contracts Admin/ReviewPendingParticipantUpdates.aspx', heading: 'Review Pending Participant Updates' } // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingParticipantUpdates.aspx
}

/** Group Address form: element id suffixes and validation messages. */
export const groupAddressForm = {
  identifier: 'TextboxIdentifier', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:14
  address1: 'TextboxAddress1', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:18
  address2: 'TextboxAddress2', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:22
  country: 'DropDownCountry', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:38
  telephone: 'TextboxTelephone', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:42
  packing: 'TextboxPackingInstructions', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:46
  required: [/^An identifier/, /^At least two Address/, /^The Country for/], // source: probe 2026-11-02 alt text of validator images on GroupAddress.aspx
  createLink: 'Create Group Address', // source: probe 2026-11-02 GroupAddressList.aspx links
  editLink: 'Edit', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddressList.aspx:18
  save: 'Save', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:51
  cancel: 'Cancel', // source: app/ProficiencyTestingWeb/Contracts Admin/GroupAddress.aspx:52
  syntheticTelephone: '02081234567', // source: synthetic value
  syntheticAddress: '1 Test Street' // source: synthetic value
}

export const pendingUpdates = {
  columns: ['QAL Number', 'Customer Name', 'Details'], // source: probe 2026-11-02 ReviewPendingCustomerUpdates.aspx rows
  detailsLink: 'Details', // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingCustomerUpdates.aspx:18
  buttons: ['Approve', 'Decline', 'Cancel'] // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx:288-290
}

export const participantMessages = {
  country: 'The Country for this participant must be specified', // source: probe 2026-11-02 EditParticipantDetails.aspx
  submitted: 'Updated details submitted' // source: probe 2026-11-02 EditParticipantDetails.aspx
}

export const participantForm = {
  fields: ['Contact Name', 'Organisation Name', 'Address 1', 'Address 2', 'Telephone'], // source: probe 2026-11-02 EditParticipantDetails.aspx
  update: 'UPDATE DETAILS', // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx:109
  cancel: 'CANCEL' // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx:205
}

/** Links on the admin home menu, in the order observed. */
export const adminHomeLinks = ['Home', 'Help', 'System Administration', 'Manage Contracts', 'Manage Schemes', 'Distributions', 'Test Consultant', 'Assessor', 'Results Sign-off', 'System information'] // source: docs/discovery/crawl-admin.json /home.aspx

export const adminHelpHref = /QuickReferenceGuide\.pdf/ // source: docs/discovery/crawl-admin.json /QuickReferenceGuide.pdf

/** Admin search forms: element id suffixes, tabs, labels and messages. */
export const adminSearch = {
  ...moreSearchTargets,
  schemes: { box: 'TextboxSchemeName', button: 'ButtonSearchScheme' }, // source: probe 2026-11-02 /Scheme Admin/Search.aspx
  distributions: { box: 'TextboxSearchDistributionNumber', button: 'ButtonSearchByDistributionNumber' }, // source: probe 2026-11-02 /Distributions/Search.aspx
  distributionSamples: { box: 'TextboxSearchSampleNumber', button: 'ButtonSearchBySampleNumber' }, // source: probe 2026-11-03 /Distributions/Search.aspx
  participantLabelsByCode: { box: 'TextboxSearchLabCode', button: 'ButtonSearch' }, // source: probe 2026-11-03 /Distributions/ParticipantAddress.aspx
  participantLabelsByName: { box: 'TextboxSearchLabName', button: 'ButtonSearch' }, // source: probe 2026-11-03 /Distributions/ParticipantAddress.aspx
  participantLabelsByContact: { box: 'TextboxSearchContactName', button: 'ButtonSearch' }, // source: probe 2026-11-03 /Distributions/ParticipantAddress.aspx
  contracts: { box: 'TextboxSearchQAL', button: 'ButtonSearchCustomer' }, // source: probe 2026-11-02 /Contracts Admin/Search.aspx
  users: { box: 'TextboxSearch', button: 'Button_Search' }, // source: probe 2026-11-02 /Admin/UserCreate.aspx
  noResults: 'There are no Results to Display', // source: probe 2026-11-02 /Scheme Admin/Search.aspx
  distributionTabs: ['Distribution Number', 'Sample Number'], // source: probe 2026-11-02 /Distributions/Search.aspx
  contractsTabs: ['Customers', 'Participants'], // source: probe 2026-11-02 /Contracts Admin/Search.aspx
  customerFields: ['QAL Number:', 'Account Number:', 'Name:', 'Contact Name:', 'Organisation:', 'Country:'], // source: probe 2026-11-02 /Contracts Admin/Search.aspx
  userInstruction: 'Type in the Id number (eg m123456), forename or surname of the user to be created.' // source: probe 2026-11-02 /Admin/UserCreate.aspx
}

/** Customers and Schemes lists in ProficiencyTestingWeb. */
export const adminLists = {
  customerColumns: ['QAL Number', 'Name', 'Organisation', 'Details', 'Participants', 'Contracts'], // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  customerLinks: ['Create Customer', 'Review Pending Customer Updates', 'Review Pending Participant Updates', 'Review Pending Orders'], // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  statusOptions: ['Active Only', 'Inactive Only', 'All'], // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  statusSelect: 'ddlCustomerStatus', // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  filterButton: 'Filter', // source: probe 2026-11-02 /Contracts Admin/CustomerList.aspx
  schemeColumns: ['Identifier', 'Name', 'Current Year', 'Next Year', 'History'], // source: probe 2026-11-02 /Scheme Admin/SchemeList.aspx
  schemeLinks: ['Create Scheme for Current Year', 'Create Scheme for Next Year', 'Printable Schemes'], // source: probe 2026-11-02 /Scheme Admin/SchemeList.aspx
  seededScheme: { identifier: 'PT0001', name: 'African Horse Sickness (AHS)' } // source: probe 2026-11-02 /Scheme Admin/SchemeList.aspx
}

/** Customer details update cycle (external submit, admin review). */
export const customerUpdate = {
  qal: 'QAL/0432', // source: data/seed/apply.sql customer of the seeded participant
  contactLabel: 'Contact Name', // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx.vb:218 (LoadLabelNames)
  updateButton: 'UPDATE DETAILS', // source: app/ProficiencyTestingExternalWeb/EditCustomerDetails.aspx
  declinedMessage: 'Customer updates declined successfully' // source: app/ProficiencyTestingWeb/Contracts Admin/PendingCustomerUpdateDetails.aspx.vb:46
}

/** Participant details update cycle (external submit, admin review). */
export const participantUpdate = {
  labCode: '1300', // source: data/seed/apply.sql participant of the debug SSO user
  contactLabel: 'Contact Name', // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx
  updateButton: 'UPDATE DETAILS', // source: app/ProficiencyTestingExternalWeb/EditParticipantDetails.aspx:109
  declinedMessage: 'Participant updates declined successfully' // source: app/ProficiencyTestingWeb/Contracts Admin/PendingParticipantUpdateDetails.aspx.vb:49
}

/** Distribution list pages whose search filter is remembered by the server for the signed-in user. */
export const distributionListRoutes = {
  previousDistributions: '/DistributionsPrevious.aspx', // source: probe 2026-11-03 DistributionsPrevious.aspx
  reports: '/Tabulations.aspx' // source: probe 2026-11-03 Tabulations.aspx
}

/** Order wizard (PendingContractOrder.aspx): first step selects schemes and months, second step is the Pending Order summary. */
export const orderWizard = {
  route: '/PendingContractOrder.aspx?year=current', // source: probe 2026-11-03 PendingContractOrder.aspx
  title: 'Create New Order', // source: probe 2026-11-03 h1
  summaryTitle: 'Pending Order', // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx.vb:1032
  summaryButtons: ['SUBMIT', 'PREVIOUS', 'SAVE', 'PRINT'], // source: probe 2026-11-03 summary buttons
  next: 'Next' // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:566
}

/** Admin review of submitted orders. */
export const orderReview = {
  route: '/Contracts Admin/ReviewPendingOrders.aspx', // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingOrders.aspx
  detailsLink: 'Details', // source: app/ProficiencyTestingWeb/Contracts Admin/ReviewPendingOrders.aspx:22
  submit: 'SUBMIT' // source: app/ProficiencyTestingExternalWeb/PendingContractOrder.aspx:918
}

/** Pages with an editable list: add form, Edit and Remove links per row, optional search box. */
export const crudPages = {
  countries: { route: '/Admin/ManageCountries.aspx', heading: 'Manage Countries', addName: 'TextboxNewName', addButton: 'ButtonAdd' }, // source: app/ProficiencyTestingWeb/Admin/ManageCountries.aspx
  externalTCs: { route: '/Admin/ManageExternalTCs.aspx', heading: 'Manage External Test Consultants', addName: 'TextboxNewName', addButton: 'ButtonAdd', extra: { TextboxNewDepartment: 'E2E Department', TextboxNewEmail: 'e2e.consultant@example.com' } }, // source: app/ProficiencyTestingWeb/Admin/ManageExternalTCs.aspx
  viewers: { route: '/Admin/ManageViewers.aspx', heading: 'Manage Viewers', addName: 'TextboxNewName', addButton: 'ButtonAdd', extra: { TextboxNewEmail: 'e2e.viewer@example.com' } }, // source: app/ProficiencyTestingWeb/Admin/ManageViewers.aspx:55-57 (page did not load on 2026-11-03, DEF-010)
  testTypes: { route: '/Scheme Admin/TestTypeList.aspx', heading: 'Test Types', addName: 'TextboxNewName', addButton: 'ButtonAdd' }, // source: app/ProficiencyTestingWeb/Scheme Admin/TestTypeList.aspx
  testResultItems: { route: '/Scheme Admin/TestResultItemTypeList.aspx', heading: 'Test Result Items', addName: 'TextboxNewName', addButton: 'ButtonAdd', search: { box: 'TextboxSearchResultItemName', button: 'ButtonSearchByResultItemName' } }, // source: app/ProficiencyTestingWeb/Scheme Admin/TestResultItemTypeList.aspx
  testMethodItems: { route: '/Scheme Admin/TestMethodItemTypeList.aspx', heading: 'Test Method Items', addName: 'TextboxNewName', addButton: 'ButtonAdd', search: { box: 'TextboxSearchMethodItemName', button: 'ButtonSearchByMethodItemName' } }, // source: app/ProficiencyTestingWeb/Scheme Admin/TestMethodItemTypeList.aspx
  categoryItems: { route: '/Scheme Admin/CategoryItemTypeList.aspx', heading: 'Category Items', addName: 'TextboxNewCategoryName', addButton: 'ButtonAddCategory' }, // source: app/ProficiencyTestingWeb/Scheme Admin/CategoryItemTypeList.aspx
  criterionItems: { route: '/Scheme Admin/CriterionItemTypeList.aspx', heading: 'Criterion Items', addName: 'TextboxNewName', addButton: 'ButtonAdd' } // source: app/ProficiencyTestingWeb/Scheme Admin/CriterionItemTypeList.aspx
}
