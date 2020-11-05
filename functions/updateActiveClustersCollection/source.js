exports = async function() 
{
  const snapshot_id = await context.functions.execute('create_snapshot');
  return context.functions.execute('process_snapshot', snapshot_id);
};
