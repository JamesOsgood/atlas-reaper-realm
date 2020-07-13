
exports = async function(changeEvent) 
{
    const mongodb = context.services.get("MasterAtlas");
    const task = changeEvent.fullDocument;
    const task_type = task.type;
    if ( task_type == 'PAUSE_CLUSTER' )
    {
        // Update task
        await context.functions.execute('update_task_status', task['_id'], task.last_updated, task.status, 'IN_PROGRESS');
        context.functions.execute('log_message', 'INFO', 'trigger', 'trigger_execute_task', `Paused cluster ${task.projectName}:${task.clusterName}`, task.snapshot_id);
    }
    else if ( task_type == 'PAUSE_BI_CONNECTOR' )
    {
        // Update task
        await context.functions.execute('update_task_status', task['_id'], task.last_updated, task.status, 'IN_PROGRESS');
        context.functions.execute('log_message', 'INFO', 'trigger', 'trigger_execute_task', `Paused bi connector for cluster ${task.projectName}:${task.clusterName}`, task.snapshot_id);
    }
    else
    {
        context.functions.execute('log_message', 'ERROR', 'trigger', 'trigger_execute_task', `Unknown task ${task_type}`, task.snapshot_id);
    }
};