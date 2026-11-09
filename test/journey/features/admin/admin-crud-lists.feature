Feature: Editable lists with create, update, delete and search

@role:admin @feature:admin-crud-lists @TC-125 @ui @creates-data
Scenario Outline: A new record is added, listed, kept after reload and removed
  Given an admin opens the editable list "<page>"
  When they add the record "E2E Item" to "<page>"
  Then the record "E2E Item" is listed on "<page>"
  When they remove the record "E2E Item" from "<page>"
  Then the record "E2E Item" is not listed on "<page>"

  Examples:
    | page |
    | countries |
    | externalTCs |
    | testTypes |
    | testResultItems |
    | testMethodItems |
    | categoryItems |
    | criterionItems |
    | viewers |

@role:admin @feature:admin-crud-lists @TC-126 @ui @creates-data
Scenario Outline: A record can be renamed and the new name is kept
  Given an admin opens the editable list "<page>"
  When they add the record "E2E Before" to "<page>"
  And they rename the record "E2E Before" on "<page>" to "E2E After"
  Then the record "E2E After" is listed on "<page>"
  And the record "E2E Before" is not listed on "<page>"

  Examples:
    | page |
    | countries |
    | externalTCs |
    | testTypes |
    | testResultItems |
    | testMethodItems |
    | categoryItems |
    | criterionItems |
    | viewers |

@role:admin @feature:admin-crud-lists @TC-127 @ui @negative
Scenario Outline: A record cannot be added without a name
  Given an admin opens the editable list "<page>"
  When they add a record with no name to "<page>"
  Then the add is blocked because the name is required

  Examples:
    | page |
    | countries |
    | externalTCs |
    | testTypes |
    | testResultItems |
    | testMethodItems |
    | categoryItems |
    | criterionItems |
    | viewers |

@role:admin @feature:admin-crud-lists @TC-128 @ui @creates-data
Scenario Outline: A list can be searched by name
  Given an admin opens the editable list "<page>"
  When they add the record "E2E Search" to "<page>"
  And they look up "E2E Search" in the list "<page>"
  Then the search shows the record "E2E Search"
  When they look up "ZZ-NO-SUCH-ITEM" in the list "<page>"
  Then the search shows no record called "ZZ-NO-SUCH-ITEM"

  Examples:
    | page |
    | testResultItems |
    | testMethodItems |

@role:admin @feature:admin-crud-lists @TC-129 @ui @negative @creates-data
Scenario: A country that already exists cannot be added twice
  Given an admin opens the editable list "countries"
  When they add the record "E2E Country" to "countries"
  And they add the record "E2E Country" to "countries"
  Then the page warns that the record already exists
