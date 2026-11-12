/**
 * Everything the internal journeys know about PTL.InternalWeb: routes, headings, messages.
 * Each entry is grounded in C:\Dev\apha-ptl-apps-main\src\PTL.InternalWeb (paths are relative to that folder).
 * The default MVC route is {controller=Account}/{action=Login}/{id?} (PTL.ApiClient/PtlWebApplicationExtensions.cs:132).
 */

/** @typedef {{ path: string, heading: string, policy: string, source: string }} InternalPage */

/** Parameterless GET pages. Policy is the role the page needs (Authorization/PtlPolicies.cs). @type {InternalPage[]} */
const pageList = [
  { path: '/Home/Index', heading: 'Home', policy: 'any', source: 'Features/Home/Views/Index.cshtml:6' },
  { path: '/Search/Index', heading: 'Search', policy: 'ContractsAdmin', source: 'Features/Search/Views/Index.cshtml' },
  { path: '/Contract/ManageContracts', heading: 'Manage Contracts', policy: 'ContractsAdmin', source: 'Features/Contract/Views/ManageContracts.cshtml' },
  { path: '/Customer/Index', heading: 'Customers', policy: 'ContractsAdmin', source: 'Features/Customer/Views/Index.cshtml:15' },
  { path: '/Customer/Create', heading: 'Create Customer', policy: 'ContractsAdmin', source: 'Features/Customer/Views/Create.cshtml:6' },
  { path: '/Customer/ReviewPendingCustomerUpdates', heading: 'Review Pending Customer Updates', policy: 'ContractsAdmin', source: 'Features/Customer/Views/ReviewPendingCustomerUpdates.cshtml' },
  { path: '/Participant/ReviewPendingParticipantUpdates', heading: 'Review Pending Participant Updates', policy: 'ContractsAdmin', source: 'Features/Participant/Views/ReviewPendingParticipantUpdates.cshtml' },
  { path: '/Contract/ReviewPendingOrders', heading: 'Review Pending Orders', policy: 'ContractsAdmin', source: 'Features/Contract/Views/ReviewPendingOrders.cshtml' },
  { path: '/Contract/Exports', heading: 'Exports', policy: 'ContractsAdmin', source: 'Features/Contract/Views/Exports.cshtml' },
  { path: '/Contract/ImportPermits', heading: 'Import Permit(s)', policy: 'ContractsAdmin', source: 'Features/Contract/Views/ImportPermits.cshtml' },
  { path: '/Contract/RenewContracts', heading: 'Renew Contracts', policy: 'ContractsAdmin', source: 'Features/Contract/Views/RenewContracts.cshtml' },
  { path: '/GroupAddress/Index', heading: 'Group Addresses', policy: 'ContractsAdmin', source: 'Features/GroupAddress/Views/Index.cshtml' },
  { path: '/GroupAddress/Create', heading: 'Create Group Address', policy: 'ContractsAdmin', source: 'Features/GroupAddress/Views/Create.cshtml' },
  { path: '/Invoice/Index', heading: 'Invoice Generation', policy: 'InvoiceGeneration', source: 'Features/Invoice/Views/Index.cshtml' },
  { path: '/Scheme/ManageSchemes', heading: 'Manage Schemes', policy: 'SchemeAdmin', source: 'Features/Scheme/Views/ManageSchemes.cshtml' },
  { path: '/Scheme/Index', heading: 'Schemes', policy: 'SchemeAdmin', source: 'Features/Scheme/Views/Index.cshtml' },
  { path: '/Scheme/Search', heading: 'Search', policy: 'SchemeAdmin', source: 'Features/Scheme/Views/Search.cshtml' },
  { path: '/Scheme/PrintableSchemes', heading: 'Printable Schemes', policy: 'SchemeAdmin', source: 'Features/Scheme/Views/PrintableSchemes.cshtml' },
  { path: '/Scheme/Create', heading: 'Create Scheme', policy: 'SchemeAdmin', source: 'Features/Scheme/Views/Create.cshtml' },
  { path: '/SchemeAdmin/CategoryItemType', heading: 'Category Items', policy: 'SchemeAdmin', source: 'Features/SchemeAdmin/CategoryItemTypeViewModel.cs:34' },
  { path: '/SchemeAdmin/TestType', heading: 'Test Types', policy: 'SchemeAdmin', source: 'Features/SchemeAdmin/TestTypeViewModel.cs:34' },
  { path: '/SchemeAdmin/CriterionItemType', heading: 'Criterion Items', policy: 'SchemeAdmin', source: 'Features/SchemeAdmin/CriterionItemTypeViewModel.cs:34' },
  { path: '/SchemeAdmin/TestResultItemType', heading: 'Test Result Items', policy: 'SchemeAdmin', source: 'Features/SchemeAdmin/TestResultItemTypeViewModel.cs:9' },
  { path: '/SchemeAdmin/TestMethodItemType', heading: 'Test Method Items', policy: 'SchemeAdmin', source: 'Features/SchemeAdmin/TestMethodItemTypeViewModel.cs:9' },
  { path: '/SystemAdministration/Index', heading: 'System Administration', policy: 'Admin', source: 'Features/SystemAdministration/Views/Index.cshtml' },
  { path: '/SystemAdministration/ManageUserRoles', heading: 'Manage Roles', policy: 'Admin', source: 'Features/SystemAdministration/Views/ManageUserRoles.cshtml' },
  { path: '/SystemAdministration/CreateUser', heading: 'Create user', policy: 'Admin', source: 'Features/SystemAdministration/Views/CreateUser.cshtml' },
  { path: '/SystemAdministration/RemoveUser', heading: 'Remove User', policy: 'Admin', source: 'Features/SystemAdministration/Views/RemoveUser.cshtml' },
  { path: '/SystemAdministration/InternalTestConsultantDepartment', heading: 'Internal Test Consultant Department', policy: 'Admin', source: 'Features/SystemAdministration/Views/InternalTestConsultantDepartment.cshtml' },
  { path: '/SystemAdministration/ExternalTestConsultantManagement', heading: 'Manage External Test Consultants', policy: 'Admin', source: 'Features/SystemAdministration/Views/ExternalTestConsultantManagement.cshtml' },
  { path: '/SystemAdministration/ViewerManagement', heading: 'Manage Viewers', policy: 'Admin', source: 'Features/SystemAdministration/Views/ViewerManagement.cshtml' },
  { path: '/SystemAdministration/CountryManagement', heading: 'Manage Countries', policy: 'Admin', source: 'Features/SystemAdministration/Views/CountryManagement.cshtml' },
  { path: '/SystemAdministration/ExternalSiteManagement', heading: 'External Site Management', policy: 'Admin', source: 'Features/SystemAdministration/Views/ExternalSiteManagement.cshtml' },
  { path: '/SystemAdministration/AdministrationCharge', heading: 'Administration Charges', policy: 'Admin', source: 'Features/SystemAdministration/Views/AdministrationCharge.cshtml' },
  { path: '/SystemAdministration/WeightedPricingPlan', heading: 'Weighted Pricing Plan', policy: 'Admin', source: 'Features/SystemAdministration/Views/WeightedPricingPlan.cshtml' },
  { path: '/SystemAdministration/PostagePricingPlan', heading: 'Postage Pricing Plan', policy: 'Admin', source: 'Features/SystemAdministration/Views/PostagePricingPlan.cshtml' },
  { path: '/Distribution/Index', heading: 'Distributions', policy: 'Distributions', source: 'Features/Distribution/Views/Index.cshtml' },
  { path: '/Distribution/Search', heading: 'Search', policy: 'Distributions', source: 'Features/Distribution/Views/Search.cshtml' },
  { path: '/Test%20Consultant', heading: 'Test Consultant', policy: 'TestConsultant', source: 'Features/TestConsultant/TestConsultantController.cs [Route("Test Consultant")]' },
  { path: '/Assessor', heading: 'Assessor', policy: 'Assessor', source: 'Features/Assessor/AssessorController.cs [Route("Assessor")]' },
  { path: '/Results%20Sign-off', heading: 'Results Sign-off', policy: 'ResultsSignOff', source: 'Features/ResultsSignOff/ResultsSignOffController.cs [Route("Results Sign-off")]' }
]

/** Extra role-gated pages that need query values but are refused before binding. source: Features/Distribution/DistributionController.cs [Authorize] attributes */
const matrixExtra = [
  { path: '/Distribution/Preparation?year=2026&monthId=4', policy: 'InternalUser' },
  { path: '/Distribution/Packaging?year=2026&monthId=4', policy: 'InternalUser' },
  { path: '/Distribution/ResultsReceipt?year=2026&monthId=4', policy: 'InternalUser' },
  { path: '/Distribution/Schedule?year=2026&monthId=4', policy: 'Scheduling' },
  { path: '/Distribution/Tabulations?year=2026&monthId=4', policy: 'Scheduling' }
]

export const internal = {
  routes: {
    home: '/Home/Index',
    login: '/Account/Login', // source: PtlWebApplicationExtensions.cs:132 default route
    signedOut: '/Account/SignedOut',
    sessionExpired: '/Account/SessionExpired',
    notPermitted: '/Account/NotPermitted',
    accessDenied: '/AccessDenied', // source: Features/Account/AccountController.cs HttpGet("/AccessDenied")
    customers: '/Customer/Index',
    customerCreate: '/Customer/Create',
    search: '/Search/Index'
  },
  /** Host that the app challenges to; source: live probe of the root URL (302). */
  identityProviderHost: 'login.microsoftonline.com',
  pages: {
    home: { heading: 'Home', welcome: 'Welcome to QAU Proficiency Testing.' }, // source: Features/Home/Views/Index.cshtml:6-9
    signedOut: { heading: 'You have signed out' },
    sessionExpired: { heading: 'Session expired' },
    notPermitted: { heading: 'You cannot sign in with this account' },
    accessDenied: { heading: 'Access Denied' },
    customers: { heading: 'Customers' },
    customerCreate: { heading: 'Create Customer' },
    search: { heading: 'Search' }
  },
  list: pageList,
  matrix: [...pageList.map(({ path, policy }) => ({ path, policy })), ...matrixExtra],
  /** Headings that mean a page failed even though it answered. source: Account/AccessDenied.cshtml, Views/Shared/Error.cshtml */
  failureHeadings: ['Access Denied', 'Error', 'Sorry, there is a problem with the service'],
  customers: {
    statuses: ['Active', 'Inactive', 'All'], // source: Features/Customer/Views/Index.cshtml:24-26
    columns: ['QAL Number', 'Name', 'Organisation', 'Status', 'Details', 'Participants', 'Contracts'], // source: Index.cshtml:42-48
    empty: 'There are no customers to display.',
    filterButton: 'Filter'
  },
  customerDetails: {
    // source: Features/Customer/Views/Details.cshtml
    sections: ['Customer Details', 'Contact Details', 'Invoice Details', 'Other'],
    actions: ['Edit Customer', 'Go to Participants Page', 'Go to Contracts Page']
  },
  customerForm: {
    submit: 'Create Customer', // source: Features/Customer/Views/Create.cshtml:13
    cancel: 'Cancel',
    summaryTitle: 'There is a problem', // source: PTL.SharedUI/TagHelpers/GovUkErrorSummaryTagHelper.cs
    nameLabel: 'Name',
    typeLabel: 'Customer Type',
    // source: Features/Customer/CustomerViewModel.cs CustomerFormViewModel
    errors: {
      nameRequired: 'Enter Name',
      nameTooLong: 'Name must not exceed 50 characters',
      typeRequired: 'Select a Customer Type',
      fileNumberFormat: 'Registered file number must match the format QAL/nnnnn',
      telephoneChars: 'Telephone contains characters that are not allowed',
      emailInvalid: 'Enter a valid email address'
    }
  },
  search: {
    // source: Features/Search/SearchViewModel.cs
    customerTab: 'Customers',
    participantTab: 'Participants',
    searchButton: 'Search',
    resultsHeading: 'Search Results:',
    noResults: 'There are no Results to Display',
    labels: {
      qalNumber: 'QAL Number',
      accountNumber: 'Account Number',
      name: 'Name',
      contactName: 'Contact Name',
      organisation: 'Organisation',
      labCode: 'Lab Code',
      labName: 'Lab Name'
    },
    maxLengths: { qalNumber: 10, accountNumber: 20, name: 50, labCode: 8 },
    errors: {
      qalNumber: 'QAL Number must be 10 characters or fewer',
      labCode: 'Lab Code must be 8 characters or fewer'
    }
  }
}

