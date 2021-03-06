/*
   Thursday, June 4, 202012:01:43 AM
   User: duke
   Server: lotherington.database.windows.net
   Database: Projects
   Application: 
*/

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.CategoryAppTable
	DROP CONSTRAINT categoryapptable_categoryapptable_id_foreign
GO
ALTER TABLE dbo.category SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.category', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.category', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.category', 'Object', 'CONTROL') as Contr_Per BEGIN TRANSACTION
GO
ALTER TABLE dbo.CategoryAppTable ADD CONSTRAINT
	categoryapptable_categoryapptable_id_foreign FOREIGN KEY
	(
	CategoryAppTable_id
	) REFERENCES dbo.category
	(
	category_id
	) ON UPDATE  NO ACTION 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.CategoryAppTable SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
select Has_Perms_By_Name(N'dbo.CategoryAppTable', 'Object', 'ALTER') as ALT_Per, Has_Perms_By_Name(N'dbo.CategoryAppTable', 'Object', 'VIEW DEFINITION') as View_def_Per, Has_Perms_By_Name(N'dbo.CategoryAppTable', 'Object', 'CONTROL') as Contr_Per 