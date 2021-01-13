"use strict";
var params = {
  Destination: { /* required */
    CcAddresses: [
      'xxxxxxxxxxxx@gmail.com',
      /* more items */
    ],
    ToAddresses: [
      'xxxxxxxxxxxx@gmail.com',
      /* more items */
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
       Charset: "UTF-8",
       Data: "HTML_FORMAT_BODY"
      },
      Text: {
       Charset: "UTF-8",
       Data: "TEXT_FORMAT_BODY"
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'Female Rating declined in current month'
     }
    },
  Source: 'xxxxxxxxxxxx@gmail.com', /* required */
  ReplyToAddresses: [
     'xxxxxxxxxxxx@gmail.com',
    /* more items */
  ],
};


const AthenaExpress = require("athena-express"),
	aws = require("aws-sdk");

	/* AWS Credentials are not required here 
    /* because the IAM Role assumed by this Lambda 
    /* has the necessary permission to execute Athena queries 
    /* and store the result in Amazon S3 bucket */

const athenaExpressConfig = {
	aws,
	db: "vineet-medium-super-market",
	getStats: true
};
const athenaExpress = new AthenaExpress(athenaExpressConfig);

async function triggerNotification(params) {
    return new Promise(function (resolve, reject) {
        // Do async job
       new aws.SES({apiVersion: '2010-12-01'}).sendEmail(params, function (err, data) {
            if (err) {
            	console.error(err, err.stack);
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}


exports.handler = async (event, context, callback) => {
	try {
		const sqlQueryOne = "SELECT avg(rating) as count FROM super_market_sales  where date between '1/1/2019' and '1/31/2019'  and gender='Female'";
		let resultOne = await athenaExpress.query(sqlQueryOne);
		console.log(resultOne.Items[0].count)
		const sqlQueryTwo = "SELECT avg(rating) as count FROM super_market_sales  where date between '2/1/2019' and '2/30/2019'  and gender='Female'";
		let resultTwo = await athenaExpress.query(sqlQueryTwo);
		console.log(resultTwo.Items[0].count)
		if (resultTwo.Items[0].count<resultOne.Items[0].count)
		{
		let snsResult =	await triggerNotification(params);
        console.log("MessageID is " + snsResult.MessageId);
		}
		callback(null, resultTwo);
	} catch (error) {
		callback(error, null);
	}
};
