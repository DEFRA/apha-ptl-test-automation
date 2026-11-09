/** Scheme tabs: save and apply buttons by tab, and the tabulation, test consultant and move controls. */
export const schemeTabs = {
  save: { 'Distribution Level Data': 'ButtonSave3', 'Results Tabulations': 'ButtonSave4', 'Test consultants': 'ButtonSave6' }, // source: probe 2026-11-03 Scheme.aspx tab buttons
  apply: { 'Distribution Level Data': 'ButtonApply3', 'Results Tabulations': 'ButtonApply4', 'Test consultants': 'ButtonApply6' }, // source: probe 2026-11-03 Scheme.aspx tab buttons
  cancel: { 'Distribution Level Data': 'ButtonCancel3', 'Results Tabulations': 'ButtonCancel4', 'Test consultants': 'ButtonCancel6' }, // source: probe 2026-11-03 Scheme.aspx tab buttons
  tabulation: { addNew: 'BtnAddNewTabulation', name: 'TextboxNewTabulationName', add: 'lnkAddTabulation', renameBox: 'TextboxTabulationReName', rename: 'lnkRenameTabulation' }, // source: Scheme.aspx:1029-1056, probe 2026-11-03
  consultants: ['DropDownTestConsultant1', 'DropDownTestConsultant2', 'DropDownTestConsultant3'], // source: probe 2026-11-03 Scheme.aspx Test consultants tab
  moveMethod: { down: 'lnkMoveMethodItemDown', up: 'lnkMoveMethodItemUp' } // source: probe 2026-11-03 Scheme.aspx Tests tab
}

export const testItems = {
  addTest: { link: 'Add New Test', select: 'select[id$=cboTestTypes]', button: 'input[id$=lnkAddTest]', remove: 'Remove Test' }, // source: Scheme.aspx:766-780
  result: { link: 'a[id$=lnkAddResult]', select: 'select[id$=cboResultTypes]', button: 'input[id$=lnkAddResult]', rows: '[id$=grdResults] [id$=lnkRemove]' }, // source: Scheme.aspx:606-613, 801-808
  method: { link: 'a[id$=lnkAddMethod]', select: 'select[id$=cboMethodTypes]', button: 'input[id$=lnkAddMethod]', rows: '[id$=grdMethods] [id$=lnkRemove]' }, // source: Scheme.aspx:653-660, 832-839
  category: { link: 'a[id$=lnkAddCategory]', select: 'select[id$=cboCategoryTypes]', button: 'input[id$=lnkAddCategory]', rows: '[id$=lnkRemoveCategory]' }, // source: Scheme.aspx:692-755, 863-870
  criterion: { link: 'a[id$=lnkAddCriterion]', select: 'select[id$=cboCriterionTypes]', button: 'input[value="Add Criterion"]', rows: '[id$=grdCriteria] [id$=lnkRemove]' } // source: Scheme.aspx:735-742, 893-901
}

