# cadasta-api v0.0.0



- [Activity](#activity)
	- [Request all activities](#request-all-activities)
	
- [Parcel](#parcel)
	- [Request one parcel](#request-one-parcel)
	- [Request all parcels](#request-all-parcels)
	
- [Relationship](#relationship)
	- [Request one relationship](#request-one-relationship)
	- [Request all relationships](#request-all-relationships)
	


# Activity

## Request all activities



	GET /activity


### Examples

Example usage:

```
curl -i http://localhost/activity
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
        "activity_type": "party",
        "id": 2,
        "type": "",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "activity_type": "relationship",
        "id": 2,
        "type": "Own",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
```
# Parcel

## Request one parcel



	GET /parcel/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| <p>Number</p> 			|  <p>parcel's unique ID.</p> 							|

### Examples

Example usage:

```
curl -i http://localhost/parcel/1
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
                "active": false,
                "archived": null,
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



	GET /parcel


### Examples

Example usage:

```
curl -i http://localhost/parcel
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
                "active": false,
                "archived": null,
                "time_created": "2015-08-06T15:41:26.440037-07:00",
                "time_updated": null,
                "created_by": 1,
                "updated_by": null
            }
        }
    ]
}
```
# Relationship

## Request one relationship



	GET /relationship/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| <p>Number</p> 			|  <p>parcel's unique ID.</p> 							|

### Examples

Example usage:

```
curl -i http://localhost/relationship
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



	GET /relationship


### Examples

Example usage:

```
curl -i http://localhost/relationship
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

