
exports = async function(org_id, snapshot_id, snapshot_ts) 
{
    const resp = await context.functions.execute("atlas_api_get_projects_for_org_id", org_id);
    for ( var i = 0; i < resp.results.length; i++ )
    { 
      const project = resp.results[i];
      await context.functions.execute("atlas_api_snapshot_clusters_for_project_id", project.id, snapshot_id, snapshot_ts);
    }
}
