# Appcelerator Packager for NPM
Package many [types of components](#types-of-components) for Appcelerator Titanium, Alloy and Arrow projects for distribution via NPM, including [modules](#module) and [support for nested dependencies](#support-for-nested-dependencies).

* [Browse Appcelerator Components on NPM](https://www.npmjs.com/browse/keyword/appc-npm)

> **NOTE:** The packager only updates/adds a `package.json` and `appc-npm` postinstall executable. It adds **no dependencies** and does not change your code.

## Install the packager [![NPM](https://img.shields.io/npm/v/appc-npm.svg?style=flat-square)](https://npmjs.com/appc-npm)

```
$ [sudo] npm install -g appc-npm
```

## Package & Publish to NPM
Simply navigate to your Titanium module or library, Alloy widget, sync adapter, Arrow connector or other component and run `appc-npm <type> [src]` with the [component type](#types-of-components) and optional path (defaulting to CWD).

```
$ cd myWidget

$ appc-npm widget
+ alloy-widget-myWidget@1.0.0

$ npm publish
+ alloy-widget-myWidget@1.0.0
```

You probably want to check `package.json` before you publish and set [fields](https://docs.npmjs.com/files/package.json) like `description`, `homepage`, `bugs`, `license` and `repository`.

## Install a package from NPM

```
$ npm install alloy-widget-myWidget --save

> alloy-widget-myWidget@1.0.0 postinstall /Users/fokkezb/myProject/node_modules/alloy-widget-myWidget
> node ./appc-npm

alloy-widget-myWidget@1.0.0 node_modules/alloy-widget-myWidget
```

After which you'll find the widget in:

```
./app/widgets/myWidget
```

For modules and widgets the bundled installer will also update the `tiapp.xml` and `app/config.json` to add the dependency.

## Support for nested dependencies
You can add dependencies to other Appcelerator dependencies on NPM to the `package.json` of your packaged component. So if your Alloy widget depends on a library, module or other widget then you can install them all in one go.

```
$ npm install alloy-widget-myWidget --save

> alloy-widget-myWidget@1.0.0 postinstall /Users/fokkezb/myProject/node_modules/alloy-widget-myWidget
> node ./appc-npm

> appc-lib-xp.ui@1.0.0 postinstall /Users/fokkezb/myProject/node_modules/alloy-widget-myWidget/node_modules/appc-lib-xp.ui
> node ./appc-npm

alloy-widget-myWidget@1.0.0 node_modules/alloy-widget-myWidget
├── appc-lib-xp.ui@1.0.0
```

After which you'll find the widget and the lib it depends on in:

```
./app/widgets/myWidget
./app/lib/xp.ui.js
```

## Update a package
Run the command again to update the packaged installer and update the `package.json`'s version (for modules and widgets) and list of files to ignore or unzip by the installer. It will not overwrite any other changes you made to the `package.json`.

```
$ appc-npm widget
+ alloy-widget-myWidget@1.0.1
```

## Types of Components
You can package the following types of components:

### `module`
Titanium modules. Run it in the [folder above the platform folders](https://github.com/viezel/NappDrawer) to package the most recent distribution ZIP file of each platform. Run it in a platform folder to package only that one.

Reads the `manifest` to populate the `package.json`. It will check if the `moduleid` is available on NPM and fall back to `ti-module-<moduleid>` as name. It wil sum the versions of all platforms to be the package version.

Only the most recent ZIP file of each platform and the `appc-npm` installer are added to the `package.json`'s `files` property so that only these will be packaged and published to NPM and not the full module source.

* [Browse Titanium modules on NPM](https://www.npmjs.com/browse/keyword/ti-module)

### `lib`
Titanium, Alloy or Arrow CommonJS libraries. Searches for the first `.js` and uses `alloy-sync-<filename>` as the package name and `1.0.0` for the version. All other files are ignored for the installer.

* [Browse Appcelerator libraries on NPM](https://www.npmjs.com/browse/keyword/appc-lib)

### `widget`
Alloy Widgets. Uses `widget.json` to populate the `package.json` and ignores that same file for the installer. It will check if the widget `id` is available on NPM and fall back to `alloy-widget-<id>` as the package name.

* [Browse Alloy widgets on NPM](https://www.npmjs.com/browse/keyword/alloy-widget)

### `sync`
Alloy sync adapters. Searches for the first `.js` and uses `alloy-sync-<filename>` as the package name and `1.0.0` for the version. All other files are ignored for the installer.

* [Browse Alloy sync adapters on NPM](https://www.npmjs.com/browse/keyword/alloy-sync)

### `theme`
Alloy themes. Uses `alloy-sync-<dirname>` as the package name and `1.0.0` for the version. It ignores the generated `package.json` for the installer.

* [Browse Alloy themes adapters on NPM](https://www.npmjs.com/browse/keyword/alloy-theme)

### `connector`
Arrow connectors. Searches for `package.json` to determine the target for the installer and will update the file with the `postinstall` script and `appc-npm` property, leaving the name and version as it is.

* [Browse Arrow connectors on NPM](https://www.npmjs.com/browse/keyword/arrow-connector)

### `block`
Arrow post or pre-blocks. Searches for the first `.js` to determine the base path and adds that file to the list of paths to copy to the project. The default package name is `arrow-block-<filename>` and version is `1.0.0`.

* [Browse Arrow blocks on NPM](https://www.npmjs.com/browse/keyword/arrow-block)

## Module API

You can also require `appc-npm` as a module, which is exactly [what the CLI does](bin/appc-npm).

## Test [![Travis](https://img.shields.io/travis/FokkeZB/appc-npm.svg)](https://travis-ci.org/FokkeZB/appc-npm) [![Dependency Status](https://david-dm.org/FokkeZB/appc-npm.svg)](https://david-dm.org/FokkeZB/appc-npm) [![devDependency Status](https://david-dm.org/FokkeZB/appc-npm/dev-status.svg)](https://david-dm.org/FokkeZB/appc-npm#info=devDependencies)

To lint and run all tests you need Grunt and a recent version of NPM:

```
$ [sudo] npm install -g grunt
$ [sudo] npm install -g npm
$ npm install
$ npm test
```

To run a specific test by name (without `-test.js`):

```
$ grunt test --test <test>
```

To get a coverage report:

```
$ grunt cover
```

## Contribute

To add new types of components, provide a PR with a [type](lib/types), [fixture](test/fixtures) and [test](test).

## Issues

Please report issues and features requests in the repo's [issue tracker](https://github.com/fokkezb/appc-npm/issues).

## License

Distributed under [MIT License](LICENSE).