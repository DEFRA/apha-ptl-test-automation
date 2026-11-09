/** Menu entries of each Home section for an admin who has the Admin role only. */
export const baseMenus = {
  'System Administration': 'Manage Roles;Create User;Remove User;Internal Test Consultant Department;Manage External Test Consultants;Manage Viewers;Manage Countries;External Site Management;Administration Charges;Weighted Pricing Plan;Postage Pricing Plan',
  'Manage Contracts': 'Customers;Search;Group Addresses;Exports',
  'Manage Schemes': 'Schemes;Search;Test Types;Test Result Items;Test Method Items;Category Items;Criterion Items',
  Distributions: 'Participant Address Labels;Group Address Labels;Search' // source: Navigations/Distribution.png
} // source: Navigations/*.png and data/nav-items.json (Manage Contracts without Invoice Generation, which needs the Generate Invoices role)

export const accessDeniedText = 'You do not have permission to access this page' // source: probe 2026-11-03 /Contracts Admin/InvoiceGeneration.aspx without the role
