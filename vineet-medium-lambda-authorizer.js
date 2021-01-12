'use strict';
const AWS = require('aws-sdk');
const params = {
    region: 'us-east-1',
    userPoolId: 'xxxxxxxxxxxxxxxxxx'
}


AWS.config.update({
    region: params.region
});



//optional claims examples
const claims = {
    aud: 'xxxxxxxxxxxxxxxx',
    email_verified: true
}

const consDbClient = new AWS.DynamoDB.DocumentClient();

const Verifier = require('verify-cognito-token');
const verifier = new Verifier(params, claims);
var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
}

async function readDataFromDynamo(email) {
    return new Promise(function(resolve, reject) {
        // Do async job
        var params = {
            TableName: "access_control",
            Key: {
                "email": email
            }
        };
        consDbClient.get(params, function(err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    })
}


exports.handler = async(event, context, callback) => {
    console.log("event====> " + JSON.stringify(event));
    let token = event.authorizationToken;
    let response = await verifier.verify(token);
    console.log("result=====> " + response.status);
    let caseToken = 'allow';
    let payloadRes = JSON.parse(response.payload);
    let mappings = await readDataFromDynamo(payloadRes.email);
    let urlsArry = mappings.Item.urls;
    let urlallowed = false;
    for (let i in urlsArry) {
        if (event.methodArn.includes(urlsArry[i])) {
            urlallowed  = true;
            console.log("yes");
            break;
        }
    }
    if (response.status === 'true' && urlallowed === true) {
        caseToken = "allow";
    }
    switch (caseToken) {
        case 'allow':
            console.log(event.methodArn);
            callback(null, generatePolicy('user', 'Allow', event.methodArn));
            break;
        case 'deny':
            callback(null, generatePolicy('user', 'Deny', event.methodArn));
            break;
        case 'unauthorized':
            callback("Unauthorized"); // Return a 401 Unauthorized response
            break;
        default:
            callback("Error: Invalid token"); // Return a 500 Invalid token response
    }

};
