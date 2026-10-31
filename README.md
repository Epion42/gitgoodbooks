# gitgoodbooks

Project repo for GitGoodBooks, an innovative and fresh take on the clearly inferior goodreads monopoly.

## Team Members

- @Epion42
- @waffle87
- @cesarjavi
- @pokepottereevee
- @adppe
- @pami5470

### The ReadMe.md should include the following:

> Brief Application description
> Contributors - In this case, it will be the team Members
> Technology Stack used for the project
> Prerequisites to run the application - Any software that needs to be installed to run the application
> Instructions on how to run the application locally.
> How to run the tests
> Link to the deployed application

# GHA Integration

A GitHub Actions workflow exists, which runs on all pull requests targeting `main`, which does the following:

- Ensure JS code is formatted (via [Prettier](https://prettier.io))
- Ensure JS code is valid (via [ESLint](https://eslint.org))
- Ensure Handlebars code is formatted (via [djLint](https://github.com/djlint/djLint))

This workflow does *not* fix identified issues, but will simply mark the PR as failing.

It is the author's responsibility to make the necessary changes in order for these checks to pass.

If you use VSCode, you can install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [djLint](https://marketplace.visualstudio.com/items?itemName=monosans.djlint) extensions, and configure them appropriately to format your code.

As for the ESLint & djLint (lint-specific) checks, these will highlight validity issues with your code, which you should go fix.
