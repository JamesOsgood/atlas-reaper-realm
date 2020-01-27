function get_agg_pipeline(snapshot_id)
{
  var pipeline = [
    {
      '$match' : {
        'snapshot_id' : snapshot_id
      }
    }, {
      '$group': {
        '_id': '$snapshot_id', 
        'clusters': {
          '$push': {
            'cluster_name': '$configuration.name', 
            'project_name': '$project.name', 
            'summary': {
              '$concat': [
                {
                  '$toString': '$configuration.numShards'
                }, 'x', '$configuration.providerSettings.instanceSizeName', ' - ', '$configuration.providerSettings.providerName'
              ]
            }, 
            'details': {
              'cluster_id': '$cluster_id', 
              'project_id': '$project.id'
            }, 
            'users': '$users'
          }
        }
      }
    }, {
      '$merge': {
        'into': 'cluster_snapshot', 
        'whenMatched': 'replace'
      }
    }
  ];

  return pipeline;
}

async function insert_project_details(project_id, clusterSnapshotsDetails)
{
    const resp = await context.functions.execute("atlas_api_get_clusters_for_project_id", project.id);
    var clusters = resp.results;
    clusters.forEach(cluster => {
      var clusterDoc = {
                  "snapshot_id" : snapshot_id,
                  "cluster_id": cluster.id,
                  "name" : cluster.name,
                  "project":
                  { 
                    "id": project.id,
                    "name": project.name 
                  },
                  "configuration" : cluster};

        await clusterSnapshotsDetails.insertOne(clusterDoc);
    });
}

async function insert_project_users(project_id, clusterSnapshotsDetails)
{
    const resp = context.functions.execute("atlas_api_get_users_for_project_id", project.id);
    const users = resp.results;
    users.forEach(user => {
      user.roles.forEach(role => {
        if ((role.groupId == project.id) && (role.roleName == "GROUP_OWNER") ) {
          var userDoc = {"userId":user.id, "firstName": user.firstName, "lastName" : user.lastName, "emailAddress" : user.emailAddress };
          await clusterSnapshotsDetails.updateMany({"snapshot_id" : snapshot_id, "project.id": project.id}, { $addToSet : {"users": userDoc}});
        }
    });
  });
}

exports = async function(org_id) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshots = mongodb.db("atlas").collection("cluster_snapshot");
    const clusterSnapshotsDetails = mongodb.db("atlas").collection("cluster_snapshot_details");

    const snapshot_ts = new Date(Date.now());
    const snapshot_id = snapshot_ts.toISOString();

    const resp_project = await context.functions.execute("atlas_api_get_projects_for_org_id", org_id);
    var projects = resp.results;
    projects.forEach(project => { 
        await insert_project_details(project.id, clusterSnapshotsDetails);
        await insert_project_users_(project.id, clusterSnapshotsDetails);
    });

    const pipeline = get_agg_pipeline(snapshot_id);
    await clusterSnapshotsDetails.aggregate(pipeline).toArray();
}
