# aws-cdk
aws-cdk workshop by myself

## 1. create app stack.
```
cdk init app --language=typescript
```

## 2. install additional library for cdk.
```
npm install --save @aws-cdk/aws-dynamodb @aws-cdk/aws-lambda @aws-cdk/aws-apigateway
```

## 3. install aws-sdk for build of lambda.
```
npm install aws-sdk
```

## 4. build from ts to js.
```
npm run build
```

## 5. initial deploy.
```
cdk bootstrap
```

## 6. deploy my stack.
```
cdk deploy
```
