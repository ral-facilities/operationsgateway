# operationsgateway

OperationsGateway - user interface for operational data

## Setting up the repo

To start development, you will need to create a `.env.development.local` file based on the `.env.development` template.
You should fill this in with the credentials of the user you would like to login as to your `operationsgateway-api` instance.

You will also need to create an `public/operationsgateway-settings.json` file based on `public/operationsgateway-setting.json`.
To use the MSW mock endpoints, keep `apiUrl` as an empty string, otherwise insert the URL of an `operationsgateway-api` instance.

## Getting Started with Vite

This project uses [Vite](https://vitejs.dev/).

### Available Scripts

In the project directory, you can run:

### `yarn install`

This will install all the project dependencies. Running `yarn install` at the top
level initialises all the packages, and you will be ready to start development in any of them!

### `yarn dev`

Runs the `dev` script, which runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Runs unit tests

### `yarn e2e`

Runs the cypress e2e tests which run against mock data

### `yarn playwright:test:mccked`

Runs the playwright e2e tests which run against mock data (requires Docker)

### `yarn playwright:test:real`

Runs the playwright e2e tests which run against real data (requires Docker). You should ensure your settings file is pointing at a server and is not using the mocks.

### `yarn lint`

Lints the code. Linting should also automatically run on commit via Husky & lint-staged

### `yarn build`

Builds the app for production to the `dist` folder.\

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [building for production](https://vitejs.dev/guide/build.html) for more information.

### `yarn preview`

Deploys a static version of the build from the `dist` directory to port 5001. Use `yarn preview:build` to build and preview it in SciGateway.

For development purposes, use `yarn preview:build:dev` to build in watch mode so that changes are built automatically.
