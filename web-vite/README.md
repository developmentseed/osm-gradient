# OSM Tardis Web

## Installation and Usage

### Install Project Dependencies

- [Node](http://nodejs.org/) (see version in [.nvmrc](./.nvmrc)) or [nvm](https://github.com/creationix/nvm)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```sh
nvm install
```

Install Node modules:

```sh
yarn install
```

#### Starting the app

```sh
yarn dev
```

Compiles the javascript and launches the server making the site available at `http://localhost:9000/`.
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with live reload.
