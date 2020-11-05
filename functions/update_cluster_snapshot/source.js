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
            'instanceSizeName' : '$configuration.providerSettings.instanceSizeName',
            'numShards' : '$configuration.numShards',
            'replicationFactor' : '$configuration.replicationFactor',
            'paused' : '$configuration.paused',
            'biConnector' : '$configuration.biConnector',
            'stateName' : '$configuration.stateName',
            'summary': {
              '$concat': [
                { '$toString': '$configuration.numShards' }, 
                'x', 
                { '$toString': '$configuration.replicationFactor' }, 
                'x', 
                '$configuration.providerSettings.instanceSizeName', 
                ' - ', 
                '$configuration.providerSettings.providerName'
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

exports = async function(snapshot_id) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshotsDetails = mongodb.db("atlas").collection("cluster_snapshot_details");

    const pipeline = get_agg_pipeline(snapshot_id);
    await clusterSnapshotsDetails.aggregate(pipeline).toArray();
    return snapshot_id;
}
