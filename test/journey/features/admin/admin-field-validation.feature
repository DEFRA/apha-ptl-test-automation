Feature: Admin field validation on existing records

@role:admin @feature:admin-field-validation @TC-082 @ui @negative
Scenario Outline: Clearing a required field on an existing record blocks the save and shows its message
  Given an admin follows the click path "<path>"
  When they clear the "<field>" field and save
  Then the validation message "<message>" is shown
  And no admin server error page is shown

  Examples:
    | path | field | message |
    | Manage Contracts > Customers > Details | TextboxName | The Name for this customer must be specified |
