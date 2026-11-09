-- Seed for local journey tests: link the local debug SSO user to a real, active participant that has
-- contracts, schemes and distributions, and undo the pending participant update created by an earlier
-- probe. Run with scripts/seed-db.ps1. Undo with data/seed/rollback.sql.
-- Debug user token: app/ProficiencyTestingExternalWeb/Web.config LocalDebugUserTokenId.
UPDATE dbo.tblParticipant
SET fldSsoId = 'B4870330-BB01-48EB-AE66-017D78651D24'
WHERE fldParticipantId = '79337A39-3C4E-4433-BD1D-157E8C76D292'
  AND fldSsoId = 'F94F1094-147B-4F4D-B258-5E699114E760';

UPDATE dbo.tblPendingParticipantDetailsEdit
SET fldIsDeleted = 1
WHERE fldPendingParticipantDetailsEditId = '5E1CB8AA-5644-441F-A08B-B4DE8A0E4D35'
  AND fldIsDeleted = 0;

UPDATE dbo.tblPendingCustomerDetailsEdit
SET fldIsDeleted = 1
WHERE fldPendingCustomerDetailsEditId = '9255BC12-FD11-4B93-8370-F1698B9E2AD7'
  AND fldIsDeleted = 0;
