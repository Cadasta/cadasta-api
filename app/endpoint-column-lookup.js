/**
 * Created by rgwozdz on 8/26/15.
 */
var dictionary = {};

dictionary['/activities'] = {
    properties:['activity_type','id','type','name','parcel_id','time_created'],
    geometry:null
};

dictionary['/parcels'] = {
    properties:['id','spatial_source','user_id','area','land_use','gov_pin','active','time_created','time_updated','created_by','updated_by'],
    geometry: "geom"
};

dictionary['/relationships'] = {
    properties: ['relationship_id', 'relationship_type', 'parcel_id', 'spatial_source', 'party_id', 'first_name', 'last_name', 'time_created'],
    geometry: null
};

dictionary['/custom_get_parcels_list'] = {
    properties: ['id','time_created','area','tenure_type','num_relationships'] ,
    geometry: null
};


module.exports = dictionary;