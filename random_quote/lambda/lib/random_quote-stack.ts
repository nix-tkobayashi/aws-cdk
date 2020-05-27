//import cdk = require("@aws-cdk/cdk");
import * as cdk from '@aws-cdk/core';
import lambda = require("@aws-cdk/aws-lambda");
import api = require("@aws-cdk/aws-apigateway");
import { CognitoUserPool } from "./cognito_user_pool-stack";

export class RandomQuoteStack extends cdk.Stack {
  public readonly randomQuoteLambda: lambda.Function;
  public readonly randomQuoteApi: api.LambdaRestApi;
  constructor(scope: cdk.App, name: string, props?: cdk.StackProps) {
    super(scope, name, props);

    // Creating Lambda
    this.randomQuoteLambda = new lambda.Function(this, "randomQuote", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "random_quote.handler",
      code: lambda.Code.asset("lambda")
    });

    // Creating API Gateway of type RestAPI
    this.randomQuoteApi = new api.LambdaRestApi(this, "randomQuoteApi", {
      handler: this.randomQuoteLambda,
      proxy: false
    });

    // Integration Lambda with API Gateway
    const randomQuoteLambdaIntegration = new api.LambdaIntegration(this.randomQuoteLambda);

    // Creating cognito user pool and its authorizer
    const cognitoUserPool = new CognitoUserPool(this, "random_quote_user_pool");
    const cognitoAuthorizer = cognitoUserPool.createAuthorizer(this, this.randomQuoteApi.restApiId);

    // Creating API methods with cognito authorizer
    const quoteApiRes = this.randomQuoteApi.root.addResource("quote");
    quoteApiRes.addMethod("GET", randomQuoteLambdaIntegration, {
      authorizationType: api.AuthorizationType.COGNITO,
      authorizer: {
        authorizationType: api.AuthorizationType.COGNITO,
	authorizerId: cognitoAuthorizer.ref
      },
      apiKeyRequired: false
    });
    quoteApiRes.addMethod("POST", randomQuoteLambdaIntegration, {
      authorizationType: api.AuthorizationType.COGNITO,
      authorizer: {
        authorizationType: api.AuthorizationType.COGNITO,
        authorizerId: cognitoAuthorizer.ref
      },
      apiKeyRequired: false
    });

    // Enabling cors to both methods and root
    this.addCorsOptions(this.randomQuoteApi.root);
    this.addCorsOptions(quoteApiRes);
  }

  /**
   * Custom method which will modify the API Gateway resource and enable CORS in it.
   * Source: https://github.com/awslabs/aws-cdk/issues/906#issuecomment-480554481
   * @param apiResource
   */
  addCorsOptions(apiResource: api.IResource) {
    apiResource.addMethod(
      "OPTIONS",
      new api.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Credentials": "'false'",
              "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE'"
            }
          }
        ],
        passthroughBehavior: api.PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{"statusCode": 200}'
        }
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
              "method.response.header.Access-Control-Allow-Origin": true
            }
          }
        ]
      }
    );
  }
}

