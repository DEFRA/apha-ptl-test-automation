Feature: Navigation

@role:applicant @feature:navigation @navigation @TC-004 @ui @smoke
Scenario: Logo returns the user to the home page from another page
  Given a signed-in customer is on the Help page
  When they select the logo
  Then the home page is shown

@role:applicant @feature:navigation @navigation @TC-005 @ui
Scenario Outline: Footer links open the expected internal page for each link
  Given a signed-in customer is on the home page
  When they select the "<link>" footer link
  Then the "<link>" footer destination is shown
  When they go back to the home page
  Then the home page is shown

  Examples:
    | link              |
    | help              |
    | accessibility     |
    | systemInformation |
    | privacy           |
