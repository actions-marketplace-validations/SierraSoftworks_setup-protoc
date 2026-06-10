## Development workflow

### 1. Install tools

#### Node.js

[**npm**](https://www.npmjs.com/) is used for dependency management.

Follow the installation instructions here:<br />
https://nodejs.org/en/download

### 2. Install dependencies

To work on the codebase you have to install all the dependencies:

```
npm install
```

### 3. Coding

Now you're ready to work some [TypeScript](https://www.typescriptlang.org/) magic!

Make sure to write or update tests for your work when appropriate.

### 4. Format code

Format the code to follow the standard style for the project:

```
npm run format
```

### 5. Run tests

To run the tests:

```
npm run test
```

### 6. Build

You can compile the code locally to check that it builds:

```
npm run package
```

The bundled `dist/` directory is **not** committed to the repository — it is generated
automatically and attached to the release tags by the `Release` workflow when a GitHub
release is published. There is no need to build or commit `dist/` as part of a regular
contribution.

### 7. Commit

Everything is now ready to make your contribution to the project, so commit it to the repository and submit a pull request.

Thanks!

## Release workflow

To release a new version of the Action the workflow should be the following:

1. If the release will increment the major version, update the action refs in the examples in README.md
   (e.g., `uses: SierraSoftworks/setup-protoc@v1` -> `uses: SierraSoftworks/setup-protoc@v2`).
1. open a PR and request a review.
1. After PR is merged, create a release, following the `vX.X.X` tag name convention.
1. The `Release` workflow then builds `dist/`, attaches it to the `vX.X.X` tag, and updates the
   corresponding major version tag (e.g., `v1` for `v1.x.x`) to point at the built artifacts.
