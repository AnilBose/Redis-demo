const dynamoose = require("dynamoose");

// For offline configuration
// dynamoose.aws.sdk.config.update({
//   accessKeyId: "localhost",
//   secretAccessKey: "localhost",
//   region: "us-east-1",
// });

// dynamoose.aws.ddb.local("http://127.0.0.1:8000");
// End offline configuration

module.exports = dynamoose;
