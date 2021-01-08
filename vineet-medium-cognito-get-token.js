const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
var poolData = {
    UserPoolId: 'xxxxxxxxxxxxxxxxxxx', // Your user pool id here
    ClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your client id here
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var userData = {
	Username: 'xxxxxx@gmail.com',
	Pool: userPool,
};
var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
var authenticationData = {
	Username: 'xxxxxx@gmail.com',
	Password: 'xxxxxxxxxxxxxxx'
};
var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
	authenticationData
);

async function cognitoGetToken() {
 return new Promise((resolve, reject) => {
 cognitoUser.authenticateUser(authenticationDetails, { 
	onSuccess: function(result) {
		var accessToken = result.getAccessToken().getJwtToken();
		console.log('accessToken ======> ' + accessToken)
	
		console.log('idToken ======> ' + JSON.stringify(result));

		//POTENTIAL: Region needs to be set if not already set previously elsewhere.
		AWS.config.region = 'us-east-1';

		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: 'us-east-1:xxxxxxxxxxxxxxxxxxxxxxx', // your identity pool id here
			Logins: {
				// Change the key below according to the specific region your user pool is in.
				'cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxxx': result
					.getIdToken()
					.getJwtToken(),
			},
		});

		//refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
		AWS.config.credentials.refresh(error => {
			if (error) {
				console.error(error);
				reject(error);
			} else {
				// Instantiate aws sdk service objects now that the credentials have been updated.
				// example: var s3 = new AWS.S3();
				console.log('Successfully logged!');
				resolve("Succss");
			}
		});
	},

	onFailure: function(err) {
		console.error(JSON.stringify(err));
		reject(err);
	},
});
    });

}

exports.handler = async (event) => {
    let result = await cognitoGetToken();
    console.log(result);
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
