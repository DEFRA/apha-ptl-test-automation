Feature: External error pages

@role:applicant @feature:external-error-pages @TC-014 @ui
Scenario: Page not found error page shows its heading
  Given a signed-in customer opens the "notFound" page
  When they reload the page
  Then the "notFound" page is shown

@role:applicant @feature:external-error-pages @TC-015 @ui
Scenario: Generic error page shows its heading
  Given a signed-in customer opens the "genericError" page
  When they reload the page
  Then the "genericError" page is shown

@role:applicant @feature:external-error-pages @TC-016 @ui
Scenario: User inactive error page shows the Invalid Permissions heading
  Given a signed-in customer opens the "userInactive" page
  When they reload the page
  Then the "userInactive" page is shown

@role:applicant @feature:external-error-pages @TC-017 @ui @negative
Scenario: Unknown route returns HTTP 404
  Given a signed-in customer opens the "home" page
  When they open an unknown page
  Then the server responds with status 404
  Given a signed-in customer opens the "home" page
