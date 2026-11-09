Feature: Admin form validation

@role:admin @feature:admin-form-validation @TC-075 @ui @negative
Scenario Outline: Saving an empty customer form shows each required message
  Given an admin opens the "customer" form
  When they save the empty form
  Then the validation message "<message>" is shown
  And no admin server error page is shown

  Examples:
    | message |
    | The Name for this customer must be specified |

@role:admin @feature:admin-form-validation @TC-076 @ui @negative
Scenario Outline: Saving an empty scheme form shows each required message
  Given an admin opens the "scheme" form
  When they save the empty form
  Then the validation message "<message>" is shown
  And no admin server error page is shown

  Examples:
    | message |
    | The Scheme Instructions must be specified |

@role:admin @feature:admin-form-validation @TC-077 @ui @negative
Scenario Outline: Saving an empty groupAddress form shows each required message
  Given an admin opens the "groupAddress" form
  When they save the empty form
  Then the validation message "<message>" is shown
  And no admin server error page is shown

  Examples:
    | message |
    | An identifier must be specified for this group address |
    | At least two Address lines are required for this group address |
    | At least two Address lines are required for this group address |
    | The Country for this group address must be specified |

