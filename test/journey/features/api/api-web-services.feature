Feature: Web services

@role:anonymous @feature:api-web-services @TC-079 @api
Scenario Outline: Every web service publishes a WSDL description
  Given the web service "<service>" description is requested
  Then the description is a WSDL document

  Examples:
    | service |
    | AssessmentResultCollection.asmx |

@role:anonymous @feature:api-web-services @TC-080 @api
Scenario Outline: Every web service description lists its operations
  Given the web service "<service>" description is requested
  Then the description lists the operation "<operation>"

  Examples:
    | service | operation |
    | AssessmentResultCollection.asmx | GetAssessmentResultCollection |
