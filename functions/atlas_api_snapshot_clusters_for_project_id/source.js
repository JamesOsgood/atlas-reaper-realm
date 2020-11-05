
async function insert_project_details(snapshot_id, snapshot_ts, project, clusterSnapshotsDetails)
{
    const resp = await context.functions.execute("atlas_api_get_clusters_for_project_id", project.id);
    for ( var i = 0; i < resp.results.length; i++ )
    {
      const cluster = resp.results[i];
      var clusterDoc = {
                  "snapshot_id" : snapshot_id,
                  "ts" : snapshot_ts,
                  "cluster_id": cluster.id,
                  "name" : cluster.name,
                  "project":
                  { 
                    "id": project.id,
                    "name": project.name 
                  },
                  "configuration" : cluster};

        await clusterSnapshotsDetails.insertOne(clusterDoc);
    }
}

async function insert_project_users(snapshot_id, project, clusterSnapshotsDetails)
{
  const resp = await context.functions.execute("atlas_api_get_users_for_project_id", project.id);
  for ( var i = 0; i < resp.results.length; i++ )
  {
    const user = resp.results[i];
    for ( var j = 0; j < user.roles.length; j++ )
    {
      const role = user.roles[j];
      if ((role.groupId == project.id) && (role.roleName == "GROUP_OWNER") ) 
      {
        var userDoc = { "firstName" : user.firstName, "lastName" : user.lastName, "emailAddress" : user.emailAddress };
        await clusterSnapshotsDetails.updateMany({"snapshot_id" : snapshot_id, "project.id": project.id}, { $addToSet : {"users": userDoc}});
      }
    }
  }
}

exports = async function(project_id, snapshot_id, snapshot_ts) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshotsDetails = mongodb.db("atlas").collection("cluster_snapshot_details");

    var project = await context.functions.execute("atlas_api_get_project_by_id", project_id);
    await insert_project_details(snapshot_id, snapshot_ts, project, clusterSnapshotsDetails);
    await insert_project_users(snapshot_id, project, clusterSnapshotsDetails);
}
