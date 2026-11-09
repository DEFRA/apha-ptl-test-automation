Feature: Remaining admin functions across every menu

@role:admin @feature:admin-full-functions @TC-143 @ui
Scenario Outline: A customer's participant and contract rows open their detail pages
  Given an admin opens the "customers" admin page
  When they select the list link "<list>"
  And they select the list link "<link>"
  Then the browser is on "<route>" without a server error

  Examples:
    | list         | link           | route                                  |
    | Participants | Details        | /Contracts Admin/Participant.aspx      |
    | Participants | Viewers        | /Contracts Admin/ParticipantViewers.aspx |
    | Contracts    | Details        | /Contracts Admin/Contract.aspx         |
    | Contracts    | Contract Items | /Contracts Admin/ContractItems.aspx    |

@role:admin @feature:admin-full-functions @TC-144 @ui
Scenario Outline: A contract can be exported as a document
  Given an admin opens the "customers" admin page
  When they select the list link "Contracts"
  And they request the export "<export>"
  Then the export is answered without a server error

  Examples:
    | export               |
    | Contract             |
    | Address Confirmation |
    | Job Sheet            |
    | Renewal Letter       |

@role:admin @feature:admin-full-functions @TC-145 @ui
Scenario Outline: The tabulation sign-off page shows its actions
  Given an admin opens the "resultsSignOff" admin page
  When they open the first tabulation waiting for sign-off
  Then the page shows the button "<button>"

  Examples:
    | button           |
    | Draw tabulation  |
    | Authorise        |
    | Reject           |
    | Cancel           |

@role:admin @feature:admin-full-functions @TC-146 @ui
Scenario: Cancel on the tabulation sign-off page returns to Results Sign-off
  Given an admin opens the "resultsSignOff" admin page
  When they open the first tabulation waiting for sign-off
  And they press the button "Cancel"
  Then the page opens at "/Results Sign-off/SignOff.aspx" with the heading "Results Sign-off"

@role:admin @feature:admin-full-functions @TC-147 @ui @creates-data
Scenario: A directory user is created and then removed
  Given an admin opens the "userCreate" admin page
  When they search the directory for the configured user
  And they create the found user
  Then the user is created and Setup Roles is offered
  When they remove the created user
  Then the user is removed and Remove Another is offered

@role:admin @feature:admin-full-functions @TC-148 @ui @creates-data
Scenario: A new scheme for the current year is created with its required fields
  Given an admin opens the "schemes" admin page
  When they start a scheme for the current year
  And they fill the new scheme with a unique identifier
  And they save the scheme
  Then no admin server error page is shown

@role:admin @feature:admin-full-functions @TC-149 @ui @creates-data
Scenario: A customer's notes are changed, kept after reloading and restored
  Given an admin opens the "customers" admin page
  When they open the first customer for editing
  And they change the customer notes to a unique value
  Then the customer notes show the new value after reloading

@role:admin @feature:admin-full-functions @TC-150 @ui @creates-data
Scenario Outline: A pricing plan is renewed for the next financial year
  Given an admin opens the "<page>" admin page
  When they renew the "<key>" pricing plan
  Then the "<key>" pricing plan lists the renewed financial year

  Examples:
    | page           | key      |
    | weightedPricing | weighted |
    | postagePricing  | postage  |

@role:admin @feature:admin-full-functions @TC-151 @ui
Scenario Outline: Participant Address Labels search by a partial value lists matches
  Given an admin opens the "participantAddress" admin page
  When they search "<target>" for "<value>"
  Then the search shows some results

  Examples:
    | target                     | value |
    | participantLabelsByName    | E2E   |
    | participantLabelsByContact | Jane  |
