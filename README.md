# Ampify Devtools

> Monorepo for Ampify's Devtools source.

### Perquisites

You need to have [yarn cli](https://classic.yarnpkg.com/en/docs/install) installed.

### Installation

#### Clone repository:

```shell script
$ git clone
```

#### Install Dependencies

```shell script
$ yarn
```

### Extension

#### Build the extension:

```shell script
$ yarn workspace extention build
```

#### Install The Extension:

The extension files located in projects/extension/dist

A: Visit chrome://extensions (via omnibox or menu -> Tools -> Extensions).
B: Enable Developer mode by ticking the checkbox in the upper-right corner.
C: Click on the "Load unpacked extension..." button.
D: Select the directory containing your unpacked extension.

https://stackoverflow.com/questions/24577024/install-chrome-extension-not-in-the-store

### Publish

#### Publish packages to NPM

```shell script
$ yarn lerna publish
```

### Boilerplate

#### Build

```shell script
$ yarn workspace @ampify/boilerplate build --watch
```

### Start Dev-Server

```shell script
$ yarn workspace @ampify/boilerplate start
```
