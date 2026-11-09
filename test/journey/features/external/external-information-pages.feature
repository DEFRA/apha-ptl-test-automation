Feature: External information pages

@role:applicant @feature:external-information-pages @TC-011 @ui @smoke
Scenario Outline: Information pages load with their expected heading for each page
  Given a signed-in customer opens the "<page>" page
  Then no server error page is shown

  Examples:
    | page          |
    | information   |
    | help          |
    | about         |
    | accessibility |
    | privacy       |

@role:applicant @feature:external-information-pages @TC-012 @ui
Scenario Outline: Information pages keep their heading after the page is reloaded
  Given a signed-in customer opens the "<page>" page
  When they reload the page
  Then the "<page>" page is shown
  And no server error page is shown

  Examples:
    | page          |
    | information   |
    | help          |
    | about         |
    | accessibility |
    | privacy       |

@role:applicant @feature:external-information-pages @TC-013 @ui
Scenario: Information page opens from the home page and the user can return
  Given a signed-in customer opens the "home" page
  When they select the home page link "information"
  Then the "information" page is shown
  When they use the browser Back button
  Then the "home" page is shown
