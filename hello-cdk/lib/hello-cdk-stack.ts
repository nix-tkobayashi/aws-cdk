import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda  from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import cdk = require('@aws-cdk/core');
import { Duration } from '@aws-cdk/core';

export class HelloCdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // (1) DynamoDB
        const greetingTable = new dynamodb.Table(this, 'greeting', {
            partitionKey: {
                name: 'greetingId',
                type: dynamodb.AttributeType.STRING
            },
            tableName: 'greeting'
        });

        // (2) Lambda Function
        const putGreetingItemLambda = new lambda.Function(this, 'putGreetingItemLambda', {
            code: lambda.Code.asset('src/lambda'),  // (3)
            handler: 'hello-cdk.handler',
            runtime: lambda.Runtime.NODEJS_10_X,
            timeout: Duration.seconds(3),

            // (4) 
            environment: {
                GREETING_TABLE_NAME: greetingTable.tableName,
                REGION: 'us-east-1'
            }
        });

        // (5) grant (maybe create iam role for lambda?)
        greetingTable.grantReadWriteData(putGreetingItemLambda);


        // (6) api gateway
        const api = new apigateway.RestApi(this, 'itemsApi', {
            restApiName: 'hello-cdk-greeting'
        });
        const greetingResource = api.root.addResource('greeting');
        const greetingResource2 = api.root.addResource('greeting2');

        // (7) request integration
        const putGreetingItemIntegration = new apigateway.LambdaIntegration(
            putGreetingItemLambda,
            {
                proxy: false,
                integrationResponses: [
                    {
                        statusCode: '200',
                        responseTemplates: {
                            'application/json': '$input.json("$")'
                        }
                    }
                ],
                passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
                requestTemplates: {
                    'application/json': '$input.json("$")'
                },
            }
        );
        greetingResource.addMethod(
            'POST',
            putGreetingItemIntegration,
            {methodResponses: [{statusCode: '200',}]});
        greetingResource2.addMethod(
            'POST',
            putGreetingItemIntegration,
            {methodResponses: [{statusCode: '200',}]});

    }
}

const app = new cdk.App();
new HelloCdkStack(app, 'HelloCdkApp');
app.synth();

