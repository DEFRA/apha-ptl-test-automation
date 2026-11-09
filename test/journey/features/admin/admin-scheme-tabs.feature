Feature: Scheme tab functions

@role:admin @feature:admin-scheme-tabs @TC-179 @ui @creates-data
Scenario: A tabulation is added to a scheme, renamed and removed
  Given an admin has opened the first scheme
  When they add the tabulation "E2E Tabulation" to the scheme
  Then the tabulation is "listed" after reloading the scheme
  When they rename that tabulation to "renamed"
  Then the tabulation is "listed" after reloading the scheme
  When they remove that tabulation
  Then the tabulation is "not listed" after reloading the scheme

@role:admin @feature:admin-scheme-tabs @TC-180 @ui @creates-data
Scenario Outline: A test consultant of a scheme is changed, kept after reloading and restored
  Given an admin has opened the first scheme
  When they choose another test consultant in slot <slot> and save
  Then the test consultant slot shows the new choice after reloading the scheme

  Examples:
    | slot |
    | 1    |
    | 2    |
    | 3    |

@role:admin @feature:admin-scheme-tabs @TC-181 @ui
Scenario Outline: Apply and Cancel on a scheme tab keep the page without an error
  Given an admin has opened the first scheme
  When they press "<action>" on the scheme tab "<tab>"
  Then no admin server error page is shown

  Examples:
    | tab                     | action |
    | Distribution Level Data | Apply  |
    | Distribution Level Data | Cancel |
    | Results Tabulations     | Apply  |
    | Results Tabulations     | Cancel |
    | Test consultants        | Apply  |
    | Test consultants        | Cancel |

@role:admin @feature:admin-scheme-tabs @TC-182 @ui @creates-data
Scenario: A method item of a scheme test is moved down and back up
  Given an admin has opened the first scheme
  When they move the first method item down and back up
  Then no admin server error page is shown

@role:admin @feature:admin-scheme-tabs @TC-183 @ui @creates-data
Scenario: A test is added to a scheme and removed again
  Given an admin has opened the first scheme
  When they add a test of the last type to the scheme
  Then the scheme shows one more test
  When they remove the last test of the scheme
  Then the scheme shows its original number of tests

@role:admin @feature:admin-scheme-tabs @TC-184 @ui @creates-data
Scenario Outline: A result, method or category item is added to the first test and removed again
  Given an admin has opened the first scheme
  When they add a "<kind>" item to the first test
  Then the first test shows one more "<kind>" item
  When they remove the last "<kind>" item of the first test
  Then the first test shows its original number of "<kind>" items

  Examples:
    | kind     |
    | result   |
    | method   |
    | category |

@role:admin @feature:admin-scheme-tabs @TC-185 @ui @creates-data
Scenario: A criterion item is added to a new category of the first test and removed again
  Given an admin has opened the first scheme
  When they add a "category" item to the first test
  And they add a "criterion" item to the first test
  Then the first test shows one more "criterion" item
  When they remove the last "criterion" item of the first test
  Then the first test shows its original number of "criterion" items
  When they remove the last "category" item of the first test
  Then no admin server error page is shown
