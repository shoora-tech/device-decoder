var net = require("net");
var utils = require("./utils/utils.js")
var connectionArr = {};
var id;
var AWS = require('aws-sdk');
const { resolve } = require("path");
const { randomUUID } = require('crypto'); // Added in: node v14.17.0


AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: 'AKIAX7BFP72C6Z774WVT',
    secretAccessKey: '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',
    endpoint: new AWS.Endpoint('https://sqs.ap-south-1.amazonaws.com/'),
});


var sqs = new AWS.SQS();
const queryURL = "https://sqs.ap-south-1.amazonaws.com/547686973061/video-telematics";

var connectionArr = {};
var tcpServer = net.createServer(handlerLotin).listen(1339);
var deviceDataObj = {};

const sequelize = require('sequelize')
const {Sequelize, DataTypes} = require("sequelize");
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

function handlerLotin(connection){
  console.log("connection ESTAB");
  tcpServer.getConnections(function (error, count) {
        console.log("nspeedumber of concurrent tcp connection " + count);
  });
  connection.on('end', function () {
      console.log("server disconnected....");
  });
  connection.on('close', function () {
      console.log("closed event fired");
      clearTimeout(id)
  });

  connection.on("error", function(err){
    console.log("Caught flash policy server socket error: ");
    console.log(err.stack)
  });
  connection.on('data',async function (data) {
    // data = "7e02000038784087664106013c00000000000c000101b02fbb048bd2aa00ee0000000022110614335701040001a33b01040001a33b03020000300199310106250400000000537e";
    try{
	//console.log(connection);
	//console.log('DATA ' + connection.remoteAddress + ': ' + data);
        //console.log('data before hex conversion',data);
        data = data.toString('hex');
        console.log('Data from device--->',data);
        let dataLength = data.length
        let dataLengthFlag = data.slice(8, 10)
        deviceDataObj["dataInsertionFlag"] = false
        deviceDataObj['raw_hex_data'] = data
      if(data.slice(0, 2).toLowerCase() == '7e' ){
        if(parseInt(data.slice(2, 4),16) == 2){
          if(dataLengthFlag === '32' && dataLength === 130){
            deviceDataObj["dataInsertionFlag"] = true
          }
          if(dataLengthFlag === '34' && dataLength === 134){
            deviceDataObj["dataInsertionFlag"] = true
          }
          if(dataLengthFlag === '36' && dataLength === 138){
            deviceDataObj["dataInsertionFlag"] = true
          }
          if(dataLengthFlag === '38' && dataLength === 142){
            deviceDataObj["dataInsertionFlag"] = true
          }
          if(dataLengthFlag === '3c' && dataLength === 150){
            deviceDataObj["dataInsertionFlag"] = true
          }
          // if(dataLengthFlag === '32' && dataLength === 132){
          //   deviceDataObj["dataInsertionFlag"] = false
          // }
          // if(dataLengthFlag === '34' && dataLength === 136){
          //   deviceDataObj["dataInsertionFlag"] = false
          // }
          // if(dataLengthFlag === '36' && dataLength === 140){
          //   deviceDataObj["dataInsertionFlag"] = false
          // }
          // if(dataLengthFlag === '38' && dataLength === 144){
          //   deviceDataObj["dataInsertionFlag"] = false
          // }
          // if(dataLengthFlag === '3c' && dataLength === 152){
          //   deviceDataObj["dataInsertionFlag"] = false
          // }
           deviceDataObj['uuid'] = randomUUID();
           deviceDataObj['identifier'] = data.slice(0, 2);
           deviceDataObj['locationPacketType'] = parseInt(data.slice(2, 4),16);
           deviceDataObj['messageBodyLength'] = data.slice(4, 10);
           deviceDataObj['phoneNumber'] = data.slice(10, 22);
           deviceDataObj['msgSerialNumber'] = data.slice(22, 26);
           deviceDataObj['alarmSeries'] = data.slice(26, 34);
           deviceDataObj['terminalStatus'] = data.slice(34, 42);
           //console.log('terminal status',deviceDataObj['terminalStatus']);
	   let terminalStatus = utils.Hex2BinStr(deviceDataObj['terminalStatus']);
           //console.log(terminalStatus.length);
           //console.log('terminal status',terminalStatus);
	   //console.log('Anubhaw',terminalStatus.slice(9, 10))
	   deviceDataObj['ignitionStatus'] = parseInt(terminalStatus.slice(9, 10));
           deviceDataObj['latitude_d'] = parseInt(terminalStatus.slice(2, 3));
	   //console.log("ignition status is -> ", deviceDataObj['ignitionStatus'])
           deviceDataObj['longitude_d'] = parseInt(terminalStatus.slice(3, 4));
	   if(deviceDataObj['latitude_d'] == 0){
	      deviceDataObj['latitute'] = (parseInt(data.slice(42, 50),16)/1000000).toString();
	   }else{
	      deviceDataObj['latitute'] = (0 - parseInt(data.slice(42, 50),16)/1000000).toString();
	   }

	   if(deviceDataObj['latitude_d'] == 0){
		deviceDataObj['longitute'] = (parseInt(data.slice(50, 58),16)/1000000).toString();
	   }else{
		deviceDataObj['longitute'] = (0 - parseInt(data.slice(50, 58),16)/1000000).toString();
	   }


           //deviceDataObj['latitute'] = parseInt(data.slice(42, 50),16)/1000000;
           //deviceDataObj['longitute'] = parseInt(data.slice(50, 58),16)/1000000;
           deviceDataObj['height'] = parseInt(data.slice(58, 62),16);
           deviceDataObj['speed'] = parseInt(data.slice(62, 66),16)/10;
           deviceDataObj['direction'] = parseInt(data.slice(66, 70),16);
           deviceDataObj['device_time'] = data.slice(70, 82);
           deviceDataObj['created_at'] = new Date() ;
           deviceDataObj['updated_at'] = new Date() ;

           let timeString = data.slice(70, 82);
           var split = timeString.replace(/.{2}/g, '$&-').split('-');
           var date = '';
           var time = '';
           for(var i = 0; i<3;i++){
             if(date == ''){
               date += split[i];
             }else{
               date += '-'+split[i];
             }
           }
       
           for(var i = 3; i<6; i++){
             if(time == ''){
               time += split[i];
             }else{
               time += ':'+split[i];
             }
           }
           deviceDataObj['time'] = date+' '+time;
           //deviceDataObj['additionalInf'] = data.slice(82, 130);
           //deviceDataObj['additionalInfId'] = data.slice(82, 84);
           //deviceDataObj['additionalInfLength'] = parseInt(data.slice(84, 86),16);
           deviceDataObj['mileage'] = parseInt(data.slice(86, 94),16)/10;
           //deviceDataObj['unknownadditionalInfId'] = data.slice(94, 96);
           //deviceDataObj['unknownadditionalInfLength'] = parseInt(data.slice(96, 98),16);
           deviceDataObj['gsmNetworkStrength'] = parseInt(data.slice(98, 102),16);
           deviceDataObj['numberofSatelite'] = parseInt(data.slice(124, 126),16);

           console.log("JSON.stringify(deviceDataObj)",deviceDataObj);
           var params = {
            MessageBody: JSON.stringify(deviceDataObj),
            QueueUrl: queryURL
           };

           //console.log("Testing ",JSON.stringify(params))
           /*sqs.sendMessage(params, function(err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              
            }
           });*/

           //let sqsData = await readFromSQS();
           //console.log("sqsData",sqsData)
           if(deviceDataObj["dataInsertionFlag"]){
            deviceDataObj["is_corrupt"] = false
            
           }
           else{
            deviceDataObj["is_corrupt"] = true
           }
           await insertSQSDataInDB(deviceDataObj,deviceDataObj.uuid)
            
        }
     }
    }catch(e){
      console.log(e);
    }
  });
}


function readFromSQS(){
    return new Promise((resolve, reject) => {
        const params = {
            QueueUrl: queryURL,
            MaxNumberOfMessages: 1,
            VisibilityTimeout: 0,
            WaitTimeSeconds: 0
        };
        sqs.receiveMessage(params, (err, data) => {
            if (err) {
                reject(err, err.stack);
            } else {
                if (!data.Messages) {
                    resolve('Nothing to process');
                }
                const sqsData = JSON.parse(data.Messages[0].Body);
                resolve(sqsData)
            }
        })
    })
}

async function insertSQSDataInDB(data,uuid) {

    try {

        var iStatus = false
        if (data.ignitionStatus == 1){
            var iStatus = true
        }else {
            var iStatus = false
        }
	console.log(data);
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = `INSERT INTO alert_realtimedatabase (uuid, location_packet_type, message_body_length, imei,
                                                           message_serial_number, alarm_series, terminal_status,
                                                           ignition_status, latitude, longitude, height, speed,
                                                           direction, created_at, updated_at, is_corrupt, raw_hex_data, device_time)
                       VALUES ('${uuid}', ${data.locationPacketType}, '${data.messageBodyLength}',
                               '${data.phoneNumber}', '${data.msgSerialNumber}', '${data.alarmSeries}',
                               '${data.terminalStatus}', ${iStatus}, ${data.latitute}, ${data.longitute},
                               ${data.height}, ${data.speed}, ${data.direction}, '${date}', '${date}', '${data.is_corrupt}', '${data.raw_hex_data}', '${data.device_time}')
        `;


        console.log("rt query -> ", query)

        client.query(query, (err, res) => {
            if (err) {
                console.error("rt error ",err);
                return;
            }
            console.log('Data insert successful');
            return true;

        });
        // Insert data in device table, gps_id, and device_status
        
        const update_query = `UPDATE device_device SET ignition_status = ${iStatus}, speed= ${data.speed}, last_device_status_timestamp= '${date}' WHERE imei_number = '${data.phoneNumber}';`
        console.log("update query -> ", update_query)
        client.query(update_query, (err, res) => {
          if (err) {
              console.error("update error ", err);
              return;
          }
          console.log('Device updated successfully');
          return true;

      });
        //
        // const sequelize = new Sequelize(DB_DETAILS.database, DB_DETAILS.username, DB_DETAILS.password, {
        //     host: DB_DETAILS.endpoint,
        //     dialect: 'postgres'
        // });
        //
        // // const Device = sequelize.define('alert_realtimedatabase', {
        // //     // attributes
        // //     id: {
        // //         type: Sequelize.UUID,
        // //         defaultValue: Sequelize.UUIDV4,
        // //         primaryKey: true,
        // //     },
        // //     location_packet_type: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     message_body_length: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     imei: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     message_serial_number: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     alarm_series: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     terminal_status: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     ignition_status: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     latitude: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     longitude: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     height: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     speed: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     directions: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //     oraganization: {
        // //         type: DataTypes.STRING,
        // //         allowNull: false
        // //     },
        // //
        // // });
        //
        //
        //     await sequelize.authenticate();
        //     await sequelize.sync({alter: true})
        //
        //     console.log("alert_realtimedatabase",{
        //         "uuid" : randomUUID() ,
        //         "identifier":data.identifier,
        //         "location_packet_type": data.locationPacketType,
        //         "message_body_length": data.messageBodyLength,
        //         "imei":data.phoneNumber,
        //         "message_serial_number":data.msgSerialNumber,
        //         "alarm_series":data.alarmSeries,
        //         "terminal_status":data.terminalStatus,
        //         "ignition_status": data.ignitionStatus,
        //         "latitude":data.latitute,
        //         "longitude":data.longitute,
        //         "height":data.height,
        //         "speed":data.speed,
        //         "directions":data.direction,
        //         "oraganization":"oraganization",
        //         "created_at" : new Date(),
        //         "updated_at" : new Date() ,
        //     })
        //
        //     const resultData = await Device.create({
        //         "uuid" : randomUUID() ,
        //         "identifier":data.identifier,
        //         "location_packet_type": data.locationPacketType,
        //         "message_body_length": data.messageBodyLength,
        //         "imei":data.phoneNumber,
        //         "message_serial_number":data.msgSerialNumber,
        //         "alarm_series":data.alarmSeries,
        //         "terminal_status":data.terminalStatus,
        //         "ignition_status": data.ignitionStatus,
        //         "latitude":data.latitute,
        //         "longitude":data.longitute,
        //         "height":data.height,
        //         "speed":data.speed,
        //         "directions":data.direction,
        //         "oraganization":"oraganization",
        //         "created_at" : new Date(),
        //         "updated_at" : new Date() ,
        //     });

    } catch (error) {
        console.error('Something went Wrong :', error);
    }

}









