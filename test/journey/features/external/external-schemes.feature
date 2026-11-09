Feature: External schemes

@role:applicant @feature:external-schemes @TC-027 @ui @smoke
Scenario: View schemes card on Home opens the View Schemes page
  Given a signed-in customer opens the "home" page
  When they select the home card "viewSchemes"
  Then the "schemes" page is shown
  And no server error page is shown
  And the "schemes" page has its expected title

@role:applicant @feature:external-schemes @TC-028 @ui
Scenario: Scheme list shows the table columns and at least one scheme
  Given a signed-in customer opens the "schemes" page
  Then no server error page is shown
  And the scheme list shows its columns and at least one scheme

@role:applicant @feature:external-schemes @TC-029 @ui
Scenario: Scheme list keeps its heading after a reload
  Given a signed-in customer opens the "schemes" page
  Then the "schemes" page has its expected title
  When they reload the page
  Then the "schemes" page is shown
  And no server error page is shown
  And the scheme list shows its columns and at least one scheme

@role:applicant @feature:external-schemes @TC-030 @ui
Scenario: Browser Back from the scheme list returns to Home
  Given a signed-in customer opens the "home" page
  When they select the home card "viewSchemes"
  Then the "schemes" page is shown
  When they use the browser Back button
  Then the "home" page is shown
  And no server error page is shown
