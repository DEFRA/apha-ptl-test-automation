Feature: External comments

@role:applicant @feature:external-comments @TC-040 @ui @smoke
Scenario: Enter comments card on Home opens the Distributions page
  Given a signed-in customer opens the "home" page
  When they select the home card "enterComments"
  Then the "comments" page is shown
  And the "comments" page has its expected title
  And no server error page is shown

@role:applicant @feature:external-comments @TC-041 @ui
Scenario: Distributions comments page shows the search labels and buttons
  Given a signed-in customer opens the "comments" page
  Then the "comments" search form is shown
  And no server error page is shown

@role:applicant @feature:external-comments @TC-042 @ui @negative
Scenario: Searching distribution comments with an unknown reference then SHOW ALL keeps the page working
  Given a signed-in customer opens the "comments" page
  When they enter the unknown distribution reference
  And they select SEARCH
  Then the "comments" page is shown
  And no server error page is shown
  And no distribution is listed
  When they select SHOW ALL
  Then the "comments" page is shown
  And the "comments" search form is shown
  And the distribution reference box is empty

@role:applicant @feature:external-comments @TC-043 @ui
Scenario: Distributions comments page keeps its heading after a reload and Back returns to Home
  Given a signed-in customer opens the "home" page
  When they select the home card "enterComments"
  Then the "comments" page is shown
  When they reload the page
  Then the "comments" page is shown
  And no server error page is shown
  When they use the browser Back button
  Then the "home" page is shown
