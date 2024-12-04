import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class DrizzleAuroraDsqlCdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, 'DSQLHandler', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: 'lambda/handler.ts',
      memorySize: 1024,
      bundling: {
        bundleAwsSDK: true,
      },
    });

    handler.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['dsql:DbConnectAdmin'],
        resources: ['*'],
      })
    );
  }
}
