Feature: External pages for the seeded customer

  Background:
    Given the customer is logged in

@feature:external-seeded-data @TC-093 @ui
Scenario Outline: A page shows the seeded customer and participant identifiers
  Given the seeded customer opens "<route>"
  Then the page shows the seeded text "<text>"
  And no server error page is shown

  Examples:
    | route | text |
    | /PendingContractOrder.aspx?year=current | QAL/0432 |
    | /PendingContractOrder.aspx?year=current | 1300 |
    | /EditCustomerDetails.aspx | QAL/0432 |
    | /EditParticipantDetails.aspx | 1300 |

@feature:external-seeded-data @TC-094 @ui
Scenario Outline: A list page of the seeded customer loads without a server error
  Given the seeded customer opens "<route>"
  Then the page shows the seeded text "<text>"
  And no server error page is shown

  Examples:
    | route | text |
    | /DistributionsCurrent.aspx | Distributions |
    | /DistributionsPrevious.aspx | Distribution Reference |
    | /Tabulations.aspx | Distribution Reference |
    | /DistributionComments.aspx | Distribution Reference |
