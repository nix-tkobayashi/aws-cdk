#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RandomQuoteStack } from '../lib/random_quote-stack';

const app = new cdk.App();
new RandomQuoteStack(app, 'RandomQuoteStack');
