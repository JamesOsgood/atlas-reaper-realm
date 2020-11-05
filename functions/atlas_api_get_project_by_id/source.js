 
exports = function(projectId) 
{
    var url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+projectId;

    return context.functions.execute("atlas_api_get", url, "atlas_api_get_project");
};