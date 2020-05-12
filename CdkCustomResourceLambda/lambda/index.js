"use strict";

const cfnresponse = require('cfn-response');

exports.handler = (event, context) => {

    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));

    const params = event['ResourceProperties']; // Papameters
    //const _requestType = event['RequestType']; // Create, Delete, Update
    console.log(JSON.stringify(params));

    try {
        const data = {
            'Response': 'Your message: ' + params.Message
        };
        cfnresponse.send(event, context, cfnresponse.SUCCESS, data);
    }
    catch (error) {
        console.log(error);
        cfnresponse.send(event, context, cfnresponse.FAILED, {});
    }
};
