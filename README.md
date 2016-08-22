# My Application

Text describing your application

## Running locally

To run the sample locally:

```bash
$ npm install
$ npm start
```

## Deploying to Auth0 Extensions

```bash
$ npm run bundle 
$ wt-gallery deploy ./build/bundle.js
```

Note: Requires [webpack](https://webpack.github.io/docs/).

## Deploying to Webtask.io

If you want to host your application, you can easily  do it by using [Webtask.io](https://webtask.io).

```bash
$ npm run bundle
$ wt create ./build/bundle.js --name my-application --no-parse --no-merge
```

Note: For more information about how to setup Webtask, click [here](https://webtask.io/docs/101).

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section.
