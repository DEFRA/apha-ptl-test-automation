Feature: Read-only web service calls with arguments

@role:anonymous @feature:api-soap-args @TC-108 @api
Scenario Outline: A read-only web service operation returns its result for known identifiers
  Given the SOAP operation "<operation>" of service "<service>" is called with "<arguments>"
  Then the SOAP reply is a result for "<operation>"

  Examples:
    | service | operation | arguments |
    | AssessmentResultCollection.asmx | GetAssessmentResultCollection | tokenId=B4870330-BB01-48EB-AE66-017D78651D24;tabulationId=8AFAAB9E-E5CC-4B28-BC2E-0008BAE7056A;testId=64693847-228F-4CE9-9981-000DDFA7B944 |

@role:anonymous @feature:api-soap-args @TC-109 @api @negative
Scenario Outline: A read-only web service operation answers with a SOAP envelope for unknown identifiers
  Given the SOAP operation "<operation>" of service "<service>" is called with "<arguments>"
  Then the SOAP reply is an envelope and not an error page

  Examples:
    | service | operation | arguments |
    | AssessmentResultCollection.asmx | GetAssessmentResultCollection | tokenId=B4870330-BB01-48EB-AE66-017D78651D24;tabulationId=00000000-0000-0000-0000-000000000000;testId=00000000-0000-0000-0000-000000000000 |
