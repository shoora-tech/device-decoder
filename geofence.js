const express = require('express');
const app = express();
app.use(express.json());

const DB_DETAILS = {
    "database":"shoora_fleet_management",
    "username":"shoora",
    "password":"u=4k)s&nen-&h#_3%_&+f#ieom(ztk$w)!#4azqruzofhavs99",
    "auth_type":"password authentication",
    "endpoint": "shoorabackend.caaj1e4fnlaq.ap-south-1.rds.amazonaws.com",
    "port": "5432"
}

const redis = require('redis');
const { promisifyAll } = require('bluebird');

// promisifyAll(redis);

// const runApplication = async () => {
//     // Connect to redis at 127.0.0.1 port 6379 no password.
//     let imei = "784087664163"
//     let key = "geofence_"+imei
//     const client = redis.createClient();

//     await client.setAsync('foo', 'bar');
//     const fooValue = await client.getAsync('foo');
//     // iteratte over it and check for geofence status
//     // const geos = await client.lRange(key, 0, -1)
//     // const geos = await client.lRange
//     // for(const val of geos){
//     //     console.log("geos ", val)
//     // }
//     console.log(fooValue);
// };

// runApplication();

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6380
});
// client['auth'] = null;

let x = client.get('foo', (err, reply) => {
    if (err) throw err;
        console.log(reply);
})
client.lrange('geofence_784087664163', 0, -1, (err, reply) => {
    if (err) throw err;
        console.log(reply);
        reply.forEach(geo => {
            console.log("geo is ", geo)
            // fetch related geo data
            client.get(geo, (err, data) => {
                if(err) throw err;
                console.log(data)
            })
        });
})

// method to fetch geos
function GeoFunction(imei){
    client.lrange('geofence_784087664163', 0, -1, (err, reply) => {
        if (err) throw err;
            console.log(reply);
            reply.forEach(geo => {
                // fetch related geo data
                client.get(geo, (err, data) => {
                    if(err) throw err;
                    console.log(data)
                })
            });
    })
}

// console.log(x)


// const { Client } = require('pg');

// const client = new Client({
//     user: DB_DETAILS.username,
//     host: DB_DETAILS.endpoint,
//     database: DB_DETAILS.database,
//     password: DB_DETAILS.password,
//     port: 5432,
// });

// client.connect();



// //READ Request Handlers
// app.get('/', async (req, res) => {
//     console.log('sqsData--')




// });


// app.post('/process-geofence', async(req, res) => {
//     console.log('post')

// 	console.log(JSON.stringify(req.body))
//     imei = req.body.imei
//     // grab all the associated geofences
//     // check if this device is in geofence or out of geofence
//     var olddata =[]
//     var alter = [601,603,605,607,619,621,623,625,627]

//     for (var item of req.body.alarmlist){
//         var output = olddata.filter(function(x){return x.DevIDNO==item.DevIDNO}); //arr here is you result array
//         if(!output.length>0){
//             olddata.push({DevIDNO:item.DevIDNO})
//             if(item.img != '0'){
//                 var srcAtvalue = alter.filter(function(x){return x== parseInt(item.srcAt)});
//                 if(srcAtvalue.length>0){
//                     var datacheck = await selectSQSDataInDB(item)
//                     if(!datacheck){
//                         var insertdata = await insertSQSDataInDB(item)

//                     }else {
//                         var updatedata = await upodateSQSDataInDB(item)
//                     }


//                 }else {
//                     var stTypevalue = alter.filter(function(x){return x== parseInt(item.stType)});
//                     if(stTypevalue.length>0){
//                         var datacheck = await selectSQSDataInDB(item)
//                         if(!datacheck){
//                             var insertdata = await insertSQSDataInDB(item)

//                         }else {
//                             var updatedata = await upodateSQSDataInDB(item)
//                         }


//                     }else {
//                         var typevalue = alter.filter(function(x){return x== parseInt(item.type)});
//                         if(typevalue.length>0){
//                             var datacheck = await selectSQSDataInDB(item)
//                             if(!datacheck){
//                                 var insertdata = await insertSQSDataInDB(item)

//                             }else {
//                                 var updatedata = await upodateSQSDataInDB(item)
//                             }

//                         }

//                     }

//                 }




//             }
//         }



//     }
//     res.send(req.body)

// });


// async function selectSQSDataInDB (data) {
//     return new Promise((resolve) => {

//         try {
//             var query = "SELECT * FROM alert_rawalert where alert_guid = '"+data.guid+"'"
//             client.query(query, function (err, res) {
//                 if (err) {
//                     console.error(err);
//                     resolve(false);
//                 }
//                 console.log('Data check successful',res.rows.length);
//                 if (res.rows.length > 0) {
//                     console.log('true');
//                     resolve(true);
//                 } else {
//                     console.log('false');
//                     resolve(false);
//                 }

//             });

//         } catch (error) {
//             console.error('Something went Wrong :', error);
//             resolve(false)
//         }
//     });

// }

// async function insertSQSDataInDB(data) {
//     return new Promise((resolve) => {

//         try {

//             var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

//             const query = `INSERT INTO alert_rawalert (device_id_no, alert_latitude, alert_longitude,
//                                                        alert_description, alert_guid, hd,
//                                                        info, img, p1, p2, p3,
//                                                        p4, rve, alert_type_1, src_tm, alert_type_2, time, alert_type_3,
//                                                        created_at, updated_at)
//                            VALUES ('${data.DevIDNO}', '${data.Gps.mlat}', '${data.Gps.mlng}',
//                                    '${data.desc}', '${data.guid}', '${data.hd}',
//                                    '${data.info}', '${data.img}', '${data.p1}', '${data.p2}', '${data.p3}', '${data.p4}',
//                                    '${data.rve}', '${data.srcAt}', '${data.srcTm}', '${data.stType}', '${data.time}', '${data.type}',
//                                    '${date}', '${date}')
//             `;



//             client.query(query, (err, res) => {
//                 if (err) {
//                     //console.error(err);
//                     resolve(false);
//                 }
//                 console.log('Data insert successful');
//                 resolve(true);

//             });

//         } catch (error) {
//             console.error('Something went Wrong :', error);
//             resolve(false)
//         }
//     });
// }

// async function upodateSQSDataInDB(data) {
//     return new Promise((resolve) => {

//         try {


//             var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

//             var query  = "UPDATE alert_rawalert SET  updated_at  = '"+date+"' WHERE alert_guid = '"+data.guid+"'";

//             client.query(query, function (err, res) {
//                 if (err) {
//                     console.error(err);
//                     resolve(false);
//                 }
//                 console.log('Update successful' );
//                 resolve(true)

//             });

//         } catch (error) {
//             console.error('Something went Wrong :', error);
//             resolve(false)
//         }

//     });
// }


//PORT ENVIRONMENT VARIABLE
// const port = process.env.PORT || 3005;
// app.listen(port, () => console.log(`Listening on port ${port}..`));
