//import cdk = require("@aws-cdk/cdk");
import * as cdk from '@aws-cdk/core';
import cognito = require("@aws-cdk/aws-cognito");
import api = require("@aws-cdk/aws-apigateway");

export class CognitoUserPool extends cdk.Construct {
  public readonly userPool: cognito.CfnUserPool;
  public readonly authorizer: api.CfnAuthorizer;

  constructor(scope: cdk.Construct, private name: string) {
    super(scope, name);
    this.userPool = new cognito.CfnUserPool(this, this.name, {
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: false
      }
    });

    new cognito.CfnUserPoolClient(this, name + "client", {
      userPoolId: this.userPool.ref
    });
  }

  /**
   * Returns Custom authorizer for current user pool.
   * @param scope
   * @param apiGatewayId
   */
  createAuthorizer(scope: cdk.Construct, apiGatewayId: string) {
    return new api.CfnAuthorizer(scope, "cognito_authorizer", {
      name: this.name + "_cognito_authorizer",
      restApiId: apiGatewayId,
      identitySource: "method.request.header.Authorization",
      providerArns: [this.userPool.attrArn],
      type: "COGNITO_USER_POOLS"
    });
  }
}
