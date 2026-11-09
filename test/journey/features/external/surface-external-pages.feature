Feature: Surveyed external pages

@role:applicant @feature:surface-external-pages @TC-072 @ui @smoke
Scenario Outline: Every external page loads with its expected heading
  Given the surveyed "<page>" page is opened
  Then the surveyed "<page>" page is shown
  And no server error page is shown

  Examples:
    | page |
    | external-about |

@role:applicant @feature:surface-external-pages @TC-073 @ui
Scenario Outline: Every external page keeps its heading after a reload
  Given the surveyed "<page>" page is opened
  When they reload the page
  Then the surveyed "<page>" page is shown

  Examples:
    | page |
    | external-about |

@role:applicant @feature:surface-external-pages @TC-074 @ui
Scenario Outline: The Home breadcrumb link on every external page returns to Home
  Given the surveyed "<page>" page is opened
  When they select the Home breadcrumb link
  Then the "home" page is shown

  Examples:
    | page |
    | external-about |
