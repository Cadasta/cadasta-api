CREATE OR REPLACE FUNCTION truncate_db_tables()
    RETURNS boolean AS

$BODY$

BEGIN

  	DELETE FROM project WHERE id > 1 ;
  	SELECT setval('project_id_seq', (SELECT MAX(id) FROM project));
	DELETE FROM organization WHERE id > 1 ;
	SELECT setval('organization_id_seq', (SELECT MAX(id) FROM organization));
	TRUNCATE field_data RESTART IDENTITY CASCADE;
	TRUNCATE option RESTART IDENTITY CASCADE;
	TRUNCATE parcel RESTART IDENTITY CASCADE;
	TRUNCATE relationship_geometry RESTART IDENTITY CASCADE;
	TRUNCATE parcel_history RESTART IDENTITY CASCADE;
	TRUNCATE party RESTART IDENTITY CASCADE;
	TRUNCATE project_extents RESTART IDENTITY CASCADE;
	TRUNCATE project_layers RESTART IDENTITY CASCADE;
	TRUNCATE q_group RESTART IDENTITY CASCADE;
	TRUNCATE question RESTART IDENTITY CASCADE;
	TRUNCATE raw_data RESTART IDENTITY CASCADE;
	TRUNCATE raw_form RESTART IDENTITY CASCADE;
	TRUNCATE relationship RESTART IDENTITY CASCADE;
	TRUNCATE relationship_history RESTART IDENTITY CASCADE;
	TRUNCATE resource RESTART IDENTITY CASCADE;
	TRUNCATE resource_field_data RESTART IDENTITY CASCADE;
	TRUNCATE resource_parcel RESTART IDENTITY CASCADE;
	TRUNCATE resource_party RESTART IDENTITY CASCADE;
	TRUNCATE respondent RESTART IDENTITY CASCADE;
	TRUNCATE response RESTART IDENTITY CASCADE;
	TRUNCATE responsibility RESTART IDENTITY CASCADE;
	TRUNCATE responsibility_relationship RESTART IDENTITY CASCADE;
	TRUNCATE restriction RESTART IDENTITY CASCADE;
	TRUNCATE restriction_relationship RESTART IDENTITY CASCADE;
	TRUNCATE "right" RESTART IDENTITY CASCADE;
	TRUNCATE right_relationship  RESTART IDENTITY CASCADE;
	TRUNCATE section RESTART IDENTITY CASCADE;

  RETURN TRUE;         
  
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION truncate_db_tables()
  OWNER TO postgres;