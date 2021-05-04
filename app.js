'use strict'
//Hi! If you want to use this code because you want to do a cool web demo for FPR, go right ahead! 
//Wishing you the best of luck! Once you graduate, life gets great! I promise!
//JEC 


const button0 = document.getElementsByClassName("downBtn");

const button1 = document.getElementsByClassName("upBtn");

let connected = 1;

button0[0].addEventListener('click', function() {
    if (connected)
    {
		// test 
        console.log('Down button pressed. Publishing message...');
        client.publish("windowCommandTopic","Window:DOWN:0"); 
		
    }
});


button1[0].addEventListener('click', function() {
    if (connected)
    {
        console.log('Up button pressed. Publishing message...');
        client.publish("windowCommandTopic","Window:UP:0"); 
		
    }
});



function p4(){} 
p4.sign = function(key, msg) { 
    const hash = CryptoJS.HmacSHA256(msg, key); 
    return hash.toString(CryptoJS.enc.Hex); 
}; 
p4.sha256 = function(msg) { 
    const hash = CryptoJS.SHA256(msg); 
    return hash.toString(CryptoJS.enc.Hex); 
}; 
p4.getSignatureKey = function(key, dateStamp, regionName, serviceName) { 
    const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key); 
    const kRegion = CryptoJS.HmacSHA256(regionName, kDate); 
    const kService = CryptoJS.HmacSHA256(serviceName, kRegion); 
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService); 
    return kSigning; 
};  

function getClient(success) { 
        if (!success) success = ()=> console.log("connected"); 
        const _client = initClient(); 
        const connectOptions = { 
          useSSL: true, 
          timeout: 3, 
          mqttVersion: 4, 
          onSuccess: success 
        }; 
        _client.connect(connectOptions); 
        return _client;  
    }  
    

function getEndpoint() { 
    // WARNING!!! It is not recommended to expose 
    // sensitive credential information in code. 
    // Consider setting the following AWS values 
    // from a secure source. 
    
        // example: us-east-1 
        const REGION = "";   //TODO PUT YOUR REGION HERE! 
    
        // example: blahblahblah-ats.iot.your-region.amazonaws.com 
        const IOT_ENDPOINT = "";  //TODO PUT YOUR OWN IOT ENDPOINT HERE! 
    
        // your AWS access key ID 
        const KEY_ID = ""; //TODO PUT YOUR OWN AWS ACCESS KEY HERE!
    
        // your AWS secret access key 
        const SECRET_KEY = ""; //TODO PUT YOUR OWN AWS SECRET KEY HERE! 
	//PS under no circumstances upload this file with the keys visibile to github, AWS immediately sends you an email 
	//saying your account is comprimised. It's annoying to fix. 
	//ALSO: The two keys, endpoint, AND region need to be strings, so it'll always be "my_region" or whatever. 
	// Good luck! 
    
        
            // date & time 
            const dt = (new Date()).toISOString().replace(/[^0-9]/g, ""); 
            const ymd = dt.slice(0,8); 
            const fdt = `${ymd}T${dt.slice(8,14)}Z` 
            
          const scope = `${ymd}/${REGION}/iotdevicegateway/aws4_request`; 
            const ks = encodeURIComponent(`${KEY_ID}/${scope}`); 
            let qs = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${ks}&X-Amz-Date=${fdt}&X-Amz-SignedHeaders=host`; 
            const req = `GET\n/mqtt\n${qs}\nhost:${IOT_ENDPOINT}\n\nhost\n${p4.sha256('')}`; 
            qs += '&X-Amz-Signature=' + p4.sign( 
                p4.getSignatureKey( SECRET_KEY, ymd, REGION, 'iotdevicegateway'), 
                `AWS4-HMAC-SHA256\n${fdt}\n${scope}\n${p4.sha256(req)}`
            ); 
            return `wss://${IOT_ENDPOINT}/mqtt?${qs}`; 
        }  
        
    

// gets MQTT client 
function initClient() {    
        const clientId = Math.random().toString(36).substring(7); 
        const _client = new Paho.MQTT.Client(getEndpoint(), clientId);
     
        // publish method added to simplify messaging 
        _client.publish = function(topic, payload) { 
            let payloadText = JSON.stringify(payload); 
            let message = new Paho.MQTT.Message(payloadText); 
            message.destinationName = topic; 
            message.qos = 0; 
            _client.send(message); 
        } 
        return _client; 
    } 
    
function processMessage(message) { 
    //    let info = JSON.parse(message.payloadString); 
    //    const publishData = { 
    //        author: "Arman", 
    //        body: info.body 
    //    }; 
    console.log('Message Arrived');
    //    client.publish("AW/pub", publishData); 
    } 
        



function successConnect() {
    connected = 1;
    //client.subscribe("windowStatusTopic"); 
}
function init() { 
    client = getClient(successConnect); 
    
    client.onMessageArrived = processMessage; 

    client.onConnectionLost = function(e) { 
        console.log(e); 
    }  
    
}  


let client = {}; 

init();
