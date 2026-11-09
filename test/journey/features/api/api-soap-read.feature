Feature: Read-only web service calls

@role:anonymous @feature:api-soap-read @TC-090 @api
Scenario Outline: A read-only web service operation returns its response
  Given the SOAP operation "<operation>" of service "<service>" is called
  Then the SOAP response contains the "<operation>" result

  Examples:
    | service | operation |
    | CountryCollection.asmx | GetCountryCollection |
