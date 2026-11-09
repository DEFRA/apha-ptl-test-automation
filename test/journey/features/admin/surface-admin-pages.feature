Feature: Surveyed admin pages

@role:admin @feature:surface-admin-pages @TC-069 @ui @smoke
Scenario Outline: Every admin page loads with its expected heading
  Given the surveyed "<page>" page is opened
  Then the surveyed "<page>" page is shown
  And no admin server error page is shown

  Examples:
    | page |
    | admin-about |

@role:admin @feature:surface-admin-pages @TC-070 @ui
Scenario Outline: Every admin page keeps its heading after a reload
  Given the surveyed "<page>" page is opened
  When they reload the admin page
  Then the surveyed "<page>" page is shown

  Examples:
    | page |
    | admin-about |

@role:admin @feature:surface-admin-pages @TC-071 @ui
Scenario Outline: The Home breadcrumb link on every admin page returns to Home
  Given the surveyed "<page>" page is opened
  When they select the Home breadcrumb link
  Then the "home" admin page is shown

  Examples:
    | page |
    | admin-about |
