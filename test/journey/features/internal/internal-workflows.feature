@feature:internal-workflows @role:internal
Feature: Internal exports, imports, pending updates and distribution workflow
  Source: Features/Contract (exports, imports, pending orders), Features/Customer and Participant (pending updates), Features/Distribution; live probe docs/internal/discovery

  @TC-INT-140 @regression
  Scenario Outline: Each mail merge export page lists its templates and offers upload and export
    When the user goes to "<path>"
    Then the page heading is "<heading>"
    And the first table has the columns "Filename,Upload Date,Open,Delete,Select"
    And the export page offers the template table with upload and export

    Examples:
      | path                                        | heading                             |
      | /Contract/ExportContracts                   | Export Contracts                    |
      | /Contract/ExportJobSheets                   | Export Job Sheets                   |
      | /Contract/ExportRenewalLetters              | Export Renewal Letters              |
      | /Contract/ExportAddressConfirmationLetters  | Export Address Confirmation Letters |

  @TC-INT-141 @regression
  Scenario Outline: A mail merge export downloads a file
    When the user goes to "<path>"
    And the user exports using the "<button>" button
    Then a file is downloaded

    Examples:
      | path                                       | button                  |
      | /Contract/ExportRenewalLetters             | Export UK Customers     |
      | /Contract/ExportRenewalLetters             | Export Non-UK Customers |
      | /Contract/ExportAddressConfirmationLetters | Export                  |

    @wip
    Examples: quarantined, see docs/04-potential-defects.md PD-001
      | path                                       | button                  |
      | /Contract/ExportContracts                  | Export                  |
      | /Contract/ExportJobSheets                  | Export                  |

  @TC-INT-142 @regression
  Scenario Outline: Uploading without choosing a template is rejected
    When the user goes to "<path>"
    And the user presses upload without choosing a template
    Then the page reports that the file was not found

    Examples:
      | path                                       |
      | /Contract/ExportContracts                  |
      | /Contract/ExportJobSheets                  |
      | /Contract/ExportRenewalLetters             |
      | /Contract/ExportAddressConfirmationLetters |

  @TC-INT-143 @regression
  Scenario: Import permits page lists permits or says there are none
    When the user goes to "/Contract/ImportPermits"
    Then the page heading is "Import Permit(s)"
    And the page says there are no import permits or lists them

  @TC-INT-150 @regression
  Scenario: Distributions list links to scheduling and tabulations for every initialised month
    When the user goes to "/Distribution/Index"
    Then every initialised month has both a scheduling and a tabulations link

  @TC-INT-151 @regression
  Scenario Outline: Monthly schedule and tabulations pages open for each month of the financial year
    When the user goes to "/Distribution/<page>?year=2026&monthId=<month>"
    Then the page heading is "Monthly Distributions - <label> 2026"

    Examples:
      | page         | month | label     |
      | Schedule     | 4     | Apr       |
      | Schedule     | 5     | May       |
      | Schedule     | 6     | Jun       |
      | Schedule     | 7     | Jul       |
      | Schedule     | 8     | Aug       |
      | Schedule     | 9     | Sep       |
      | Schedule     | 10    | Oct       |
      | Schedule     | 11    | Nov       |
      | Tabulations  | 4     | April     |
      | Tabulations  | 5     | May       |
      | Tabulations  | 6     | June      |
      | Tabulations  | 7     | July      |
      | Tabulations  | 8     | August    |
      | Tabulations  | 9     | September |
      | Tabulations  | 10    | October   |
      | Tabulations  | 11    | November  |

  @TC-INT-152 @regression
  Scenario: The April schedule offers participants, sample numbers and intended results
    When the user goes to "/Distribution/Schedule?year=2026&monthId=4"
    Then the April schedule lists a distribution with its participants, sample numbers and intended results

  @TC-INT-153 @regression
  Scenario Outline: A scheme's distribution detail pages open from the April schedule
    When the user opens the "<link>" link of the first scheme on the April schedule
    Then a page headed "<heading>" is shown

    Examples:
      | link                | heading                  |
      | View Participants   | Distribution Participants |
      | View Intended       | Intended Results         |

  @TC-INT-154 @regression
  Scenario Outline: Address label pages open
    When the user goes to "<path>"
    Then the page heading is "<heading>"

    Examples:
      | path                                  | heading                   |
      | /Distribution/GroupAddressLabels       | Group Address Labels       |
      | /Distribution/ParticipantAddressLabels | Participant Address Labels |

  @TC-INT-160 @regression
  Scenario Outline: Pending update lists open and say when nothing is waiting
    When the user goes to "<path>"
    Then the page heading is "<heading>"

    Examples:
      | path                                         | heading                             |
      | /Customer/ReviewPendingCustomerUpdates       | Review Pending Customer Updates     |
      | /Participant/ReviewPendingParticipantUpdates | Review Pending Participant Updates  |
      | /Contract/ReviewPendingOrders                | Review Pending Orders               |

  @TC-INT-161 @regression @write
  Scenario Outline: A pending update compares values and can be approved or declined
    Given pending update decisions are allowed in this environment
    And a pending <kind> update exists
    When the user opens the first pending update
    Then the pending update compares current and pending values
    When the user presses "<decision>" on the pending update
    Then one fewer pending update is listed

    Examples:
      | kind        | decision |
      | customer    | Approve  |
      | customer    | Decline  |
      | participant | Approve  |
      | participant | Decline  |


  @TC-INT-144 @regression @write
  Scenario: A template file can be uploaded, selected, used for an export and deleted
    When the user goes to "/Contract/ExportContracts"
    And the user uploads the template file "QATContractTemplate.docx" from the test data folder
    Then the template "QATContractTemplate.docx" is listed
    When the user selects the template "QATContractTemplate.docx"
    Then the template "QATContractTemplate.docx" is the selected template
    When the user exports contracts and waits up to 120 seconds for the file
    Then the downloaded file name matches "^ContractExport_\d{4}_\d{2}_\d{2}\.docx$"
    When the user goes to "/Contract/ExportContracts"
    And the user selects the template that was selected before
    And the user starts deleting the template "QATContractTemplate.docx"
    Then the user is asked to confirm deleting the template
    When the user declines deleting the template
    Then the template "QATContractTemplate.docx" is listed
    When the user starts deleting the template "QATContractTemplate.docx"
    And the user confirms deleting the template
    Then the template "QATContractTemplate.docx" is not listed

  @TC-INT-145 @regression @write
  Scenario Outline: A template upload that breaks the rules is rejected
    When the user goes to "/Contract/ExportContracts"
    And the user uploads a generated file named "<name>" of <size> bytes
    Then the export page reports "<message>"

    Examples:
      | name                 | size    | message                                 |
      | QAT-Hyphen-Name.docx | 100     | The file does not have a .Docx extension |
      | QATNotWord.txt       | 100     | The file does not have a .Docx extension |
      | QATTooBig.docx       | 4300000 | Maximum file size is 4MB                |

  @TC-INT-146 @regression @write
  Scenario: A template with the same name as an existing one is rejected
    When the user goes to "/Contract/ExportContracts"
    And the user uploads the template file "QATContractTemplate.docx" from the test data folder
    Then the template "QATContractTemplate.docx" is listed
    When the user uploads the template file "QATContractTemplate.docx" from the test data folder
    Then the export page reports "A file with this name already exists"

