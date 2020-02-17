
exports = async function() 
{
    const mongodb = context.services.get("MasterAtlas");
    // Get all tasks in progress
    const tasksCollection = mongodb.db("atlas").collection("tasks");

    // Get all non paused, non M0 clusters that are set to be reaped
    var filter = {
      'state': 'IN_PROGRESS'
    };
   
    var tasks = await tasksCollection.find(filter).toArray(); 
  
    const updated_ts = new Date(Date.now());
    for ( var i = 0; i < tasks.length; i++ )
    {
        const task = tasks[i];
        var status = await context.functions.execute("atlas_api_get_cluster_details", task.details.project_id, task.cluster_name);
        if ( status )
        {
            if ( task.type == 'PAUSE_CLUSTER')
            {
                if ( status.paused )
                {
                    await tasks.updateOne( {'_id' : task['_id']} , { '$set' : { 'status' : 'DONE' }});
                }
                else
                {
                    // TODO: Warn if it's been a while?
                }
            }
        }
        else
        {
            // Cluster has gone, mark task completed
            await tasks.updateOne( {'_id' : task['_id']} , { '$set' : { 'status' : 'DONE' }});
        }
    }
};