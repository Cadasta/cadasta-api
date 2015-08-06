# cadasta-api v0.0.0



- [Parcel](#parcel)
	- [Request parcel information](#request-parcel-information)
	- [Request parcel all parcels](#request-parcel-all-parcels)
	


# Parcel

## Request parcel information



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
                        [
                            -105.231556892395,
                            21.1681321755877
                        ],
                        [
                            -105.231213569641,
                            21.1652507347151
                        ],
                        [
                            -105.227437019348,
                            21.1661712010929
                        ],
                        [
                            -105.224862098694,
                            21.1647304685776
                        ],
                        [
                            -105.223617553711,
                            21.1619290040903
                        ],
                        [
                            -105.22340297699,
                            21.1582870209836
                        ],
                        [
                            -105.217137336731,
                            21.1587272654609
                        ],
                        [
                            -105.220828056335,
                            21.1639300555639
                        ],
                        [
                            -105.223445892334,
                            21.168452332221
                        ],
                        [
                            -105.223574638367,
                            21.1700931240934
                        ],
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
## Request parcel all parcels



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
                        [
                            -105.231556892395,
                            21.1681321755877
                        ],
                        [
                            -105.231213569641,
                            21.1652507347151
                        ],
                        [
                            -105.227437019348,
                            21.1661712010929
                        ],
                        [
                            -105.224862098694,
                            21.1647304685776
                        ],
                        [
                            -105.223617553711,
                            21.1619290040903
                        ],
                        [
                            -105.22340297699,
                            21.1582870209836
                        ],
                        [
                            -105.217137336731,
                            21.1587272654609
                        ],
                        [
                            -105.220828056335,
                            21.1639300555639
                        ],
                        [
                            -105.223445892334,
                            21.168452332221
                        ],
                        [
                            -105.223574638367,
                            21.1700931240934
                        ],
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

