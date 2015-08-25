# cadasta-api v0.0.0



- [Activities](#activities)
	- [Request all activities](#request-all-activities)
	
- [Custom](#custom)
	- [Parcel/Num relationships List](#parcel/num-relationships-list)
	
- [Parcels](#parcels)
	- [Request one parcel](#request-one-parcel)
	- [Request all parcels](#request-all-parcels)
	
- [Relationships](#relationships)
	- [Request one relationship](#request-one-relationship)
	- [Request all relationships](#request-all-relationships)
	


# Activities

## Request all activities



	GET /activities


### Examples

Example usage:

```
curl -i http://localhost/activities
```

### Success Response

Success-Response:

```
    HTTP/1.1 200 OK

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "activity_type": "parcel",
        "id": 1,
        "type": "survey_grade_gps",
        "name": null,
        "parcel_id": null,
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "activity_type": "parcel",
        "id": 2,
        "type": "survey_grade_gps",
        "name": null,
        "parcel_id": null,
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
```
# Custom

## Parcel/Num relationships List



	GET /custom/get_parcels_list


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| tenure_type			| <p>String</p> 			|  <p>Options: own, lease, occupy, informal occupy</p> 							|

### Examples

Example usage:

```
curl -i http://localhost/custom/get_parcels_list
```

### Success Response

Success-Response:

```
    HTTP/1.1 200 OK

{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 12,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "area": null,
                "num_relationships": 1
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 10,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "area": null,
                "num_relationships": 2
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 11,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "area": null,
                "num_relationships": 1
            }
        }
    ]
}
```
# Parcels

## Request one parcel



	GET /parcels/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| <p>Number</p> 			|  <p>parcel's unique ID.</p> 							|

### Examples

Example usage:

```
curl -i http://localhost/parcels/1
```

### Success Response

Success-Response:

```
    HTTP/1.1 200 OK
    {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -105.228338241577,
                            21.1714137482368
                        ],
                        [
                            -105.229024887085,
                            21.1694127979643
                        ],
                        ...
                        ...
                        [
                            -105.228338241577,
                            21.1714137482368
                        ]
                    ]
                ]
            },
            "properties": {
                "id": 1,
                "spatial_source": 4,
                "user_id": "1",
                "area": null,
                "land_use": null,
                "gov_pin": null,
                "active": true,
                "time_created": "2015-08-06T15:41:26.440037-07:00",
                "time_updated": null,
                "created_by": 1,
                "updated_by": null
            }
        }
    ]
}
```
## Request all parcels



	GET /parcels


### Examples

Example usage:

```
curl -i http://localhost/parcels
```

### Success Response

Success-Response:

```
    HTTP/1.1 200 OK
    {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -105.228338241577,
                            21.1714137482368
                        ],
                        [
                            -105.229024887085,
                            21.1694127979643
                        ],
                        ...
                        ...
                        [
                            -105.228338241577,
                            21.1714137482368
                        ]
                    ]
                ]
            },
            "properties": {
                "id": 1,
                "spatial_source": 4,
                "user_id": "1",
                "area": null,
                "land_use": null,
                "gov_pin": null,
                "active": true,
                "time_created": "2015-08-06T15:41:26.440037-07:00",
                "time_updated": null,
                "created_by": 1,
                "updated_by": null
            }
        }
    ]
}
```
# Relationships

## Request one relationship



	GET /relationships/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| <p>Number</p> 			|  <p>relationship's unique ID.</p> 							|

### Examples

Example usage:

```
curl -i http://localhost/relationships
```

### Success Response

Success-Response:

```
HTTP/1.1 200 OK

{
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              47.867583,
              -122.164306
            ]
          },
          "properties": {
            "relationship_id": 1,
            "relationship_type": "Own",
            "parcel_id": 1,
            "spatial_source": "survey_grade_gps",
            "party_id": 1,
            "first_name": "Daniel",
            "last_name": "Baah",
            "time_created": "2015-08-12T03:46:01.673153+00:00"
          }
        }
      ]
    }
```
## Request all relationships



	GET /relationships


### Examples

Example usage:

```
curl -i http://localhost/relationships
```

### Success Response

Success-Response:

```
    HTTP/1.1 200 OK
    {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          47.867583,
          -122.164306
        ]
      },
      "properties": {
        "relationship_id": 1,
        "relationship_type": "Own",
        "parcel_id": 1,
        "spatial_source": "survey_grade_gps",
        "party_id": 1,
        "first_name": "Daniel",
        "last_name": "Baah",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          47.670367,
          -122.387855
        ]
      },
      "properties": {
        "relationship_id": 2,
        "relationship_type": "Own",
        "parcel_id": 2,
        "spatial_source": "survey_grade_gps",
        "party_id": 2,
        "first_name": "Sarah",
        "last_name": "Bindman",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
```

