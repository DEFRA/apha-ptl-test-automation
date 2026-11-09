Feature: Admin settings pages and remaining menu functions

@role:admin @feature:admin-settings-functions @TC-130 @ui @creates-data
Scenario Outline: A settings value is changed, kept after reloading and restored
  Given an admin opens the "<page>" settings page
  When they set the "<field>" field of the "<page>" settings page to "<value>"
  And they save the "<page>" settings page
  Then the "<field>" field of the "<page>" settings page shows "<value>" after reloading

  Examples:
    | page         | field        | value                 |
    | externalSite | Email        | e2e.RUN@example.com   |
    | charges      | Euro         | 1.23                  |
    | charges      | GBP          | 2.34                  |
    | postage      | UK price     | 7                     |
    | postage      | EU price     | 8                     |
    | postage      | Non-EU price | 9                     |
    | tcDepartment | Department   | E2E Dept RUN          |

@role:admin @feature:admin-settings-functions @TC-131 @ui @negative @creates-data
Scenario Outline: An invalid settings value is not kept
  Given an admin opens the "<page>" settings page
  When they set the "<field>" field of the "<page>" settings page to "<value>"
  And they save the "<page>" settings page
  Then the "<field>" field of the "<page>" settings page shows its original value after reloading

  Examples:
    | page         | field        | value        |
    | externalSite | Email        | not-an-email |
    | externalSite | Email        |              |
    | charges      | Euro         | abc          |
    | postage      | UK price     | abc          |
    | postage      | EU price     |              |
    | postage      | Non-EU price | 1.2.3        |

@role:admin @feature:admin-settings-functions @TC-132 @ui @creates-data
Scenario Outline: Cancel discards a typed settings value
  Given an admin opens the "<page>" settings page
  When they set the "<field>" field of the "<page>" settings page to "<value>"
  And they cancel the "<page>" settings page
  Then the "<field>" field of the "<page>" settings page shows its original value after reloading

  Examples:
    | page         | field      | value               |
    | externalSite | Email      | e2e.RUN@example.com |
    | postage      | UK price   | 9.99                |
    | tcDepartment | Department | E2E Dept RUN        |

@role:admin @feature:admin-settings-functions @TC-133 @ui
Scenario Outline: Distributions search finds nothing for an unknown value
  Given an admin opens the "distributionsSearch" admin page
  When they open the "<tab>" search tab
  And they search "<target>" for "ZZ-NO-SUCH-VALUE"
  Then the search shows no results

  Examples:
    | tab           | target              |
    | Sample Number | distributionSamples |

@role:admin @feature:admin-settings-functions @TC-134 @ui @negative
Scenario Outline: Participant Address Labels search finds nothing for an unknown value and limits input length
  Given an admin opens the "participantAddress" admin page
  Then the "<target>" search box accepts at most <max> characters
  When they search "<target>" for "ZZ-NOSUCH"
  Then the "participantAddress" admin page is shown
  And no admin server error page is shown

  Examples:
    | target                     | max |
    | participantLabelsByCode    | 8   |
    | participantLabelsByName    | 50  |
    | participantLabelsByContact | 50  |

@role:admin @feature:admin-settings-functions @TC-135 @ui
Scenario Outline: Exports menu links open their page without an error
  Given an admin opens the "exports" admin page
  When they select the list link "<link>"
  Then no admin server error page is shown

  Examples:
    | link                                |
    | Export Contracts                    |
    | Export Job Sheets                   |
    | Export Renewal Letters              |
    | Export Address Confirmation Letters |

@role:admin @feature:admin-settings-functions @TC-136 @ui
Scenario: A tabulation waiting for sign-off can be opened from Results Sign-off
  Given an admin opens the "resultsSignOff" admin page
  When they open the first tabulation waiting for sign-off
  Then no admin server error page is shown
