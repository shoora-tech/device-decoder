const express = require('express');
// const Joi = require('joi');
const app = express();
app.use(express.json());
const { randomUUID } = require('crypto');

var AWS = require("aws-sdk");

AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: 'AKIAX7BFP72C6Z774WVT',
    secretAccessKey: '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',
    endpoint: new AWS.Endpoint('https://sqs.ap-south-1.amazonaws.com/'),
});

const DB_DETAILS = {
    "database":"shoora_fleet_management",
    "username":"shoora",
    "password":"u=4k)s&nen-&h#_3%_&+f#ieom(ztk$w)!#4azqruzofhavs99",
    "auth_type":"password authentication",
    "endpoint": "shoorabackend.caaj1e4fnlaq.ap-south-1.rds.amazonaws.com",
    "port": "5432"
}

const { Client } = require('pg');

const client = new Client({
    user: DB_DETAILS.username,
    host: DB_DETAILS.endpoint,
    database: DB_DETAILS.database,
    password: DB_DETAILS.password,
    port: 5432,
});

client.connect();

var sqs = new AWS.SQS();


const queryURL = "https://sqs.ap-south-1.amazonaws.com/547686973061/video-telematics";

var params = {
    MessageBody: "keshav test",
    QueueUrl: queryURL
};






//READ Request Handlers
app.get('/', async (req, res) => {
    let sqsData = await readFromSQS();
    //console.log('sqsData--', sqsData)


    res.send('Welcome to Tutorial!!'+JSON.stringify(sqsData));


});


app.get('/testing', async (req, res) => {

    var data = {
                "uuid" :"88f4e34c-1fc0-45f8-b8dc-23bbbbb59ced" ,
                "identifier":"7e",
                "locationPacketType": 2,
                "messageBodyLength": "000032",
                "phoneNumber":"784087664023",
                "msgSerialNumber":"0068",
                "alarmSeries":"00000000",
                "terminalStatus":"004c0003",
                "ignitionStatus": 1,
                "latitude":23.293768,
                "longitude":87.770803,
                "height":27,
                "speed":48.9,
                "directions":298,
                "oraganization":"oraganization",
                "created_at" : new Date(),
                "updated_at" : new Date() ,
            }
    insertSQSDataInDB(data)
    res.send('Welcome to Tutorial!!');


});
app.get('/abc', async (req, res) => {
    imei = '784087664023'
    const org_query = `SELECT organization_id from device_device WHERE imei_number='${imei}'`
    client.query(org_query, (err, res) => {
        if (err) {
            console.error("unable to get org error ", err);
            // var result = JSON.stringify(res); 
            
        }
        console.log('Device updated successfully');
        if(res.rows.length > 0){
            console.log(res.rows[0].organization_id)
            return res.rows[0].organization_id
        }
        // console.log(res.rows[0].organization_id);
    })
});

    

// app.get('/sendMessage', async (req, res) => {

//     sqs.sendMessage(params, function(err, data) {
//         if (err) {
//             console.log("Error", err);
//         } else {
//             //console.log("Success", data.MessageId);
//             //console.log('--SQS--->', data)
//         }
//     });

// });
// function readFromSQS(){
//     return new Promise((resolve, reject) => {
//         const params = {
//             QueueUrl: queryURL,
//             MaxNumberOfMessages: 10,
//             VisibilityTimeout: 0,
//             WaitTimeSeconds: 0
//         };
//         sqs.receiveMessage(params, (err, data) => {
//             if (err) {
//                 reject(err, err.stack);
//             } else {
//                 if (!data.Messages) {
//                     resolve('Nothing to process');
//                 }
//                 const sqsData = data.Messages;
//                 for (var i = 0; i < data.Messages.length; i++) {
//                     var message = data.Messages[i];
//                     var body = JSON.parse(message.Body);
//                     // execute logic
//                     removeFromQueue(message);
//                 }
//                 resolve(sqsData)
//             }
//         })
//     })
// }


// var removeFromQueue = function(message) {
//     sqs.deleteMessage({
//         QueueUrl : queryURL,
//         ReceiptHandle : message.ReceiptHandle
//     }, function(err, data) {
//         err && console.log(err);
//     });
// };

// function validateBook(book) {
//     const schema = {
//         title: Joi.string().min(3).required()
//     };
//     return Joi.validate(book, schema);

// }

// async function insertSQSDataInDB(data){

//     try {
//         var iStatus = false
//         if (data.ignitionStatus == 1){
//             var iStatus = true
//         }else {
//             var iStatus = false
//         }
//         var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
//         const query = `INSERT INTO alert_realtimedatabase (uuid,location_packet_type,message_body_length,imei,message_serial_number,alarm_series,terminal_status,ignition_status,latitude,longitude,height,speed,direction,created_at,updated_at)
//                 VALUES ('${data.uuid}', ${data.locationPacketType}, '${data.messageBodyLength}','${data.phoneNumber}','${data.msgSerialNumber}','${data.alarmSeries}','${data.terminalStatus}',${iStatus},${data.latitude},${data.longitude},${data.height},${data.speed},${data.directions},'${date}','${date}')
//                 `;


//         console.log(query)

//         client.query(query, (err, res) => {
//             if (err) {
//                 console.error(err);
//                 return;
//             }
//             console.log('Data insert successful');
//             return true;

//         });
//         //
//         // const sequelize = new Sequelize(DB_DETAILS.database, DB_DETAILS.username, DB_DETAILS.password, {
//         //     host: DB_DETAILS.endpoint,
//         //     dialect: 'postgres'
//         // });
//         //
//         // // const Device = sequelize.define('alert_realtimedatabase', {
//         // //     // attributes
//         // //     id: {
//         // //         type: Sequelize.UUID,
//         // //         defaultValue: Sequelize.UUIDV4,
//         // //         primaryKey: true,
//         // //     },
//         // //     location_packet_type: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     message_body_length: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     imei: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     message_serial_number: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     alarm_series: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     terminal_status: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     ignition_status: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     latitude: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     longitude: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     height: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     speed: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     directions: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //     oraganization: {
//         // //         type: DataTypes.STRING,
//         // //         allowNull: false
//         // //     },
//         // //
//         // // });
//         //
//         //
//         //     await sequelize.authenticate();
//         //     await sequelize.sync({alter: true})
//         //
//         //     console.log("alert_realtimedatabase",{
//         //         "uuid" : randomUUID() ,
//         //         "identifier":data.identifier,
//         //         "location_packet_type": data.locationPacketType,
//         //         "message_body_length": data.messageBodyLength,
//         //         "imei":data.phoneNumber,
//         //         "message_serial_number":data.msgSerialNumber,
//         //         "alarm_series":data.alarmSeries,
//         //         "terminal_status":data.terminalStatus,
//         //         "ignition_status": data.ignitionStatus,
//         //         "latitude":data.latitute,
//         //         "longitude":data.longitute,
//         //         "height":data.height,
//         //         "speed":data.speed,
//         //         "directions":data.direction,
//         //         "oraganization":"oraganization",
//         //         "created_at" : new Date(),
//         //         "updated_at" : new Date() ,
//         //     })
//         //
//         //     const resultData = await Device.create({
//         //         "uuid" : randomUUID() ,
//         //         "identifier":data.identifier,
//         //         "location_packet_type": data.locationPacketType,
//         //         "message_body_length": data.messageBodyLength,
//         //         "imei":data.phoneNumber,
//         //         "message_serial_number":data.msgSerialNumber,
//         //         "alarm_series":data.alarmSeries,
//         //         "terminal_status":data.terminalStatus,
//         //         "ignition_status": data.ignitionStatus,
//         //         "latitude":data.latitute,
//         //         "longitude":data.longitute,
//         //         "height":data.height,
//         //         "speed":data.speed,
//         //         "directions":data.direction,
//         //         "oraganization":"oraganization",
//         //         "created_at" : new Date(),
//         //         "updated_at" : new Date() ,
//         //     });

//     } catch (error) {
//         console.error('Something went Wrong :', error);
//     }

// }


//PORT ENVIRONMENT VARIABLE
// const port = process.env.PORT || 3000;
app.listen(3000, () => console.log('Listening on port 3000 ...'));
