const express = require('express');
const app = express();
app.use(express.json());
const { randomUUID } = require('crypto');
require('dotenv').config();

const DB_DETAILS = {
    "database":process.env.database,
    "username":process.env.username,
    "password":process.env.password,
    "auth_type":process.env.auth_type,
    "endpoint": process.env.endpoint,
    "port": process.env.port
}

const { Client } = require('pg');

const db_client = new Client({
    user: DB_DETAILS.username,
    host: DB_DETAILS.endpoint,
    database: DB_DETAILS.database,
    password: DB_DETAILS.password,
    port: 5432,
});

db_client.connect();

const redis = require('redis');

// const client = redis.createClient({
//     host: '127.0.0.1',
//     port: 6380
// });

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;

    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c;
}

function checkIfInside(spotCoordinates, center, radius) {

    console.log(spotCoordinates)
    console.log(center)

    let newRadius = distanceInKmBetweenEarthCoordinates(parseFloat(spotCoordinates[0]), parseFloat(spotCoordinates[1]), center.lat, center.lng);
    console.log(newRadius)

    if( newRadius < radius ) {
        //point is inside the circle
        return "inside"
    }
    else if(newRadius > radius) {
        //point is outside the circle
        return "outside"
    }
    else {
        //point is on the circle
        return "on the circle"
    }

}


function createGeoAlert(db_client, data){
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let uuid = randomUUID();
    const query = `INSERT INTO alert_geofencealert (uuid, alert_type, latitude, longitude,
        device_id, geofence_id, created_at, updated_at)
        VALUES ('${uuid}', '${data.alert_type}', '${data.latitude}','${data.longitude}', ${data.device_id}, ${data.geofence_id}, '${date}', '${date}')
        `;
    console.log("alert query ", query)

        db_client.query(query, (err, res) => {
        if (err) {
        console.error("rt error ",err);
        return;
        }
        console.log('Data insert successful');
        return true;

        });
}





// method to fetch geos
function GeoFunction(imei, spotCoordinates, db_client){
    const device_query = `
        SELECT 
            id 
        FROM 
            device_device 
        WHERE 
            device_device.imei_number='${imei}'`;
    console.log("device query ", device_query)
    db_client.query(device_query, (err, res) => {
        if (err) {
            console.error("unable to get vehicle error ", err);
        }
        console.log(res.rows.length)
        if(res.rows.length > 0){
            device_id = parseInt(res.rows[0].id);
            // get geofence_id
            
            client.lrange('geofence_784087664163', 0, -1, (err, reply) => {
                if (err) throw err;
                    console.log(reply);
                    reply.forEach(geo => {
                        const geofence_query = `
                            SELECT
                                id
                            FROM vehicle_geofence
                            WHERE
                                uuid='${geo}'
                        `;
                        console.log("geo query ", geofence_query)
                        db_client.query(geofence_query, (err, res) => {
                            if (err) {
                                console.error("unable to get vehicle error ", err);
                            }
                            console.log(res.rows.length)
                            if(res.rows.length > 0){
                                geofence_id = parseInt(res.rows[0].id);

                        // fetch related geo data
                        client.get(geo, (err, data) => {
                            if(err) throw err;
                            console.log(data)
                            // check if this is in geofence.
                            // let spotCoordinates1 = [26.79296, 79.02924];
                            var geo_array = data.split(',');
                            let position = checkIfInside(spotCoordinates, {"lat":parseFloat(geo_array[0]), "lng":parseFloat(geo_array[1])}, parseInt(geo_array[2]))
                            if(position == 'inside'){
                                let out_key = 'outside_'+imei+'_'+geo
                                // let outside = client.get(out_key)
                                client.get(out_key, (err, outside) => {
                                    if(err) throw err;
                                    if(outside==true | outside=="true" | outside == null){
                                        console.log("device is out of this fence and now entering for the first time")
                                        // 1. set this imei as it's inside
                                        let inside_key = 'inside_'+imei+'_'+geo
                                        client.set(inside_key, true)
                                        // 2. raise in geofence alert
                                        let alert_obj = {}
                                        alert_obj["alert_type"] = "in"
                                        alert_obj["latitude"] = spotCoordinates[0]
                                        alert_obj["longitude"] = spotCoordinates[0]
                                        alert_obj["device_id"] = device_id
                                        alert_obj["geofence_id"] = geofence_id
                                        createGeoAlert(db_client, alert_obj)
                                        // 3. set redis outside key to false
                                        client.set(out_key, false)
                                    }
                                });
                            }
                            else if(position == "outside"){
                                // check if earlier it was inside
                                let inside_key = 'inside_'+imei+'_'+geo
                                // let inside = client.get(inside_key)
                                client.get(inside_key, (err, inside) => {
                                    if(err) throw err;
                                    console.log(inside=="true")
                                    if(inside == "true" | inside ==true | inside == null){
                                        console.log("device is inside of this fence and now exiting for the first time")
                                        // 1. raise out geofence alert
                                        let alert_obj = {}
                                        alert_obj["alert_type"] = "out"
                                        alert_obj["latitude"] = spotCoordinates[0]
                                        alert_obj["longitude"] = spotCoordinates[0]
                                        alert_obj["device_id"] = device_id
                                        alert_obj["geofence_id"] = geofence_id
                                        createGeoAlert(db_client, alert_obj)
    
                                        // 2. set outside_key
                                        let outside_key = 'outside_'+imei+'_'+geo
                                        client.set(outside_key, true)
                
                                        // 3. delete redis inside key
                                        client.set(inside_key, false)
                                    }
                                });
                            }
            
                        })
                    }
                });
                    });
            })
        }
    });
        
}
// ["26.79296", "79.02924"]
GeoFunction("784087664163", ["40.79296", "79.02924"], db_client)


// function InsideGeoChecker(current ){}

// let spotCoordinates1 = [41.5408446218337, -8.612296123028727];
// let spotCoordinates2 = [38.817459, -9.282218]

// let center = {lat: 41.536558, lng: -8.627487};
// let radius = 25

// checkIfInside(spotCoordinates1);
// checkIfInside(spotCoordinates2);

// function checkIfInside(spotCoordinates) {

//     let newRadius = distanceInKmBetweenEarthCoordinates(spotCoordinates[0], spotCoordinates[1], center.lat, center.lng);
//     console.log(newRadius)

//     if( newRadius < radius ) {
//         //point is inside the circle
//         console.log('inside')
//     }
//     else if(newRadius > radius) {
//         //point is outside the circle
//         console.log('outside')
//     }
//     else {
//         //point is on the circle
//         console.log('on the circle')
//     }

// }

// function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
//   var earthRadiusKm = 6371;

//   var dLat = degreesToRadians(lat2-lat1);
//   var dLon = degreesToRadians(lon2-lon1);

//   lat1 = degreesToRadians(lat1);
//   lat2 = degreesToRadians(lat2);

//   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//           Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//   return earthRadiusKm * c;
// }


