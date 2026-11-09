Feature: External reports

@role:applicant @feature:external-reports @TC-036 @ui @smoke
Scenario: View reports card on Home opens the Reports page
  Given a signed-in customer opens the "home" page
  When they select the home card "viewReports"
  Then the "reports" page is shown
  And the "reports" page has its expected title
  And no server error page is shown

@role:applicant @feature:external-reports @TC-037 @ui
Scenario: Reports page shows the search form and the empty-state message
  Given a signed-in customer opens the "reports" page
  Then the "reports" search form is shown
  And the distribution list is shown
  And no server error page is shown

@role:applicant @feature:external-reports @TC-038 @ui @negative
Scenario: Searching reports with an unknown reference keeps the empty result and SHOW ALL restores the list
  Given a signed-in customer opens the "reports" page
  When they enter the unknown distribution reference
  And they select SEARCH
  Then the "reports" page is shown
  And no server error page is shown
  And the "noDistributions" message is shown
  When they select SHOW ALL
  Then the "reports" page is shown
  And the "reports" search form is shown
  And the distribution reference box is empty
  And the distribution list is shown

@role:applicant @feature:external-reports @TC-039 @ui
Scenario: Reports page keeps its heading after a reload and Back returns to Home
  Given a signed-in customer opens the "home" page
  When they select the home card "viewReports"
  Then the "reports" page is shown
  When they reload the page
  Then the "reports" page is shown
  And no server error page is shown
  When they use the browser Back button
  Then the "home" page is shown

