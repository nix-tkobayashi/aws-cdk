#!/usr/bin/env node
//import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import cfn = require('@aws-cdk/aws-cloudformation');
import lambda = require('@aws-cdk/aws-lambda');
import fs = require('fs');

export class CdkCustomResourceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const customResourse = new cfn.CustomResource(this, 'function', {
      provider: cfn.CustomResourceProvider.lambda(new lambda.SingletonFunction(this, 'singleton', {
        functionName: "customResourceLambdaFunction",
        uuid: '7731874a-3a77-80d5-cd8e-6350510edf90',
        code: new lambda.InlineCode(fs.readFileSync('lambda/index.js', { encoding: 'utf-8' })),
        handler: 'index.handler',
        timeout: cdk.Duration.seconds(300),
        runtime: lambda.Runtime.NODEJS_12_X
      })),
      properties: {"message": "bod boy"}
    });
    new cdk.CfnOutput(this, "response", {
      value: customResourse.getAtt('Response').toString()
    });
  }
}

const app = new cdk.App();
new CdkCustomResourceStack(app, 'CdkCustomResourceLambdaStack');
