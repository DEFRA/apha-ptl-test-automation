@feature:internal-limits @role:internal
Feature: Internal form field limits
  Every text field that the source limits has the matching maxlength in the browser.
  Generated from the live probe (scripts/gen-limits-feature.mjs); source: StringLength attributes in the *ViewModel.cs files.

  @TC-INT-060 @regression
  Scenario Outline: Text field accepts at most the documented number of characters
    When the user goes to "<path>"
    Then the first field labelled "<field>" accepts at most <max> characters

    Examples:
      | path                                                   | field                       | max |
      | /Search/Index                                          | QAL Number                  | 10  |
      | /Search/Index                                          | Account Number              | 20  |
      | /Search/Index                                          | Name                        | 50  |
      | /Search/Index                                          | Contact Name                | 50  |
      | /Search/Index                                          | Organisation                | 50  |
      | /Search/Index                                          | Lab Code                    | 8   |
      | /Search/Index                                          | Lab Name                    | 50  |
      | /Customer/Create                                       | Name                        | 50  |
      | /Customer/Create                                       | VAT Number                  | 20  |
      | /Customer/Create                                       | Account Number              | 20  |
      | /Customer/Create                                       | Customer ID                 | 30  |
      | /Customer/Create                                       | Registered File Number      | 10  |
      | /Customer/Create                                       | Contact Name                | 50  |
      | /Customer/Create                                       | Organisation Name           | 50  |
      | /Customer/Create                                       | Address 1                   | 100 |
      | /Customer/Create                                       | Address 2                   | 100 |
      | /Customer/Create                                       | Address 3                   | 100 |
      | /Customer/Create                                       | Address 4                   | 100 |
      | /Customer/Create                                       | Address 5                   | 100 |
      | /Customer/Create                                       | Telephone                   | 20  |
      | /Customer/Create                                       | Telephone 2                 | 20  |
      | /Customer/Create                                       | Fax                         | 20  |
      | /Customer/Create                                       | Email                       | 150 |
      | /Customer/Create                                       | Invoice Contact Name        | 50  |
      | /Customer/Create                                       | Invoice Organisation Name   | 50  |
      | /Customer/Create                                       | Invoice Address 1           | 100 |
      | /Customer/Create                                       | Invoice Address 2           | 100 |
      | /Customer/Create                                       | Invoice address 3           | 100 |
      | /Customer/Create                                       | Invoice Address 4           | 100 |
      | /Customer/Create                                       | Invoice Address 5           | 100 |
      | /Customer/Create                                       | Invoice Telephone           | 20  |
      | /Customer/Create                                       | Invoice Telephone 2         | 20  |
      | /Customer/Create                                       | Invoice Fax                 | 20  |
      | /Customer/Create                                       | Invoice Email               | 150 |
      | /Customer/Create                                       | Postage Arrangements        | 500 |
      | /Customer/Create                                       | Comments                    | 2000 |
      | /GroupAddress/Create                                   | Identifier                  | 50  |
      | /GroupAddress/Create                                   | Address 1                   | 100 |
      | /GroupAddress/Create                                   | Address 2                   | 100 |
      | /GroupAddress/Create                                   | Address 3                   | 100 |
      | /GroupAddress/Create                                   | Address 4                   | 100 |
      | /GroupAddress/Create                                   | Address 5                   | 100 |
      | /GroupAddress/Create                                   | Telephone                   | 20  |
      | /GroupAddress/Create                                   | Packing instructions        | 500 |
      | /Scheme/Create                                         | Identifier                  | 6   |
      | /Scheme/Create                                         | Name                        | 100 |
      | /Scheme/Create                                         | Sample Origin               | 50  |
      | /Scheme/Create                                         | Subcontractor               | 50  |
      | /Scheme/Create                                         | Sample Packing Instructions | 2000 |
      | /Scheme/Create                                         | Sample Volume               | 20  |
      | /Scheme/Create                                         | Customs Description         | 500 |
      | /Scheme/Create                                         | Consent text                | 500 |
      | /Scheme/Create                                         | Scheme Instructions         | 50000 |
      | /Scheme/Create                                         | Standard Tabulation Text    | 500 |
      | /Scheme/Search                                         | Scheme Name                 | 100 |
      | /SystemAdministration/ExternalTestConsultantManagement | Name                        | 50  |
      | /SystemAdministration/ExternalTestConsultantManagement | Department                  | 50  |
      | /SystemAdministration/ViewerManagement                 | Name                        | 50  |
      | /SystemAdministration/CountryManagement                | Name                        | 50  |
      | /SchemeAdmin/TestResultItemType                        | Search by name:             | 50  |
      | /SchemeAdmin/TestMethodItemType                        | Search by name:             | 50  |
      | /Distribution/Search                                   | Distribution Number         | 50  |
      | /Distribution/Search                                   | Sample Number               | 50  |
