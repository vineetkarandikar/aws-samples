const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var poolData = {
    UserPoolId: 'xxxxxxxxxxxx', // Your user pool id here
    ClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your client id here
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var userData = {
	Username: 'abc@gmail.com',
	Pool: userPool,
};

var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);


async function cognitioConfirmRegistration() {
  return  new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration('222222', true, function(err, result) {
            if (err) {
                console.log(err.message || JSON.stringify(err));
                reject(err.message);
            } else {
                console.log('call result: ' + result);
                resolve(result);
            }

        });
    });

}

exports.handler = async (event) => {
    let result = await cognitioConfirmRegistration();
    console.log(result);
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
