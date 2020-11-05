exports = async function() {

  // Get config
  const mongodb = context.services.get("MasterAtlas");
  const snapshotConfig = mongodb.db("atlas").collection("snapshot_config");
  const config = await snapshotConfig.findOne();
  const snapshot_ts = new Date(Date.now());
  const snapshot_id = snapshot_ts.toISOString();

  const snapshot_type = config['snapshot_type'];

  switch ( snapshot_type ) {
    case 'organisation':
      await context.functions.execute('atlas_api_snapshot_clusters_for_org_id', config['org_id'], snapshot_id, snapshot_ts);
      break;
      
    case 'project':
        await context.functions.execute('atlas_api_snapshot_clusters_for_project_id', config['project_id'], snapshot_id, snapshot_ts);
        break;

    default:
      return context.functions.execute('log_message', 'ERROR', 'function', `Unknown snapshot type ${snapshot_type}`);
    }

    return context.functions.execute('update_cluster_snapshot', snapshot_id);
};
