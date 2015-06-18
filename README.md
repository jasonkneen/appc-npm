# Appcelerator NPM Distribution ![EXPERIMENTAL](https://img.shields.io/badge/status-experimental-green.svg?style=flat-square)
Package components for Appcelerator Titanium, Alloy and Arrow projects for distribution via NPM.

* [Browse Appcelerator Components on NPM](https://www.npmjs.com/browse/keyword/appc-npm)

> **NOTE:** Running `appc-npm <type>` for your component only updates/adds a `package.json` and `appc-npm` postinstall executable. It adds **no dependencies** and does not change your code.

## Install ![NPM](https://img.shields.io/npm/v/appc-npm.svg?style=flat-square)

```
$ [sudo] npm install -g appc-npm
```

## Package & Publish
Simply navigate to your Titanium module or library, Alloy widget, sync adapter, Arrow connector or other component and run the CLI with the command for that component and optional path (defaulting to CWD).

```
$ cd mywidget

$ appc-npm widget
+ alloy-widget-myWidget@1.0.0

$ npm publish
+ alloy-widget-myWidget@1.0.0
```

> **NOTE:** You probably want to check `package.json` before you publish and set or update [fields](https://docs.npmjs.com/files/package.json) like `description`, `homepage`, `bugs`, `license`, `repository`.

## Use

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

## Nested dependencies
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

## Update
Run the command again to update the packaged installer, update the version (for components like Alloy widgets) and add missing files to copy.

```
$ appc-npm widget
+ alloy-widget-myWidget@1.0.1
```

## Commands/Types
You can use the following commands or types of components:

### `module`
Titanium modules. Run it in the [folder above the platform folders](https://github.com/viezel/NappDrawer) to package the most recent distribution ZIP file of each platform. Run it in a platform folder to package only that one.

Reads the `manifest` to populate the `package.json`, using `ti-module-<moduleid>` as name and the greatest version found for all platforms as the package version.

> **NOTE:** Only the most recent ZIP file of each platform and the `appc-npm` installer are added to the `package.json`'s `files` property so that only these will be packaged and published to NPM and not the full module source.

* [Browse Titanium modules on NPM](https://www.npmjs.com/browse/keyword/ti-module)

### `lib`
Titanium, Alloy or Arrow CommonJS libraries. Searches for the first `.js` and uses `alloy-sync-<filename>` as the package name and `1.0.0` for the version. All other files are ignored for the installer.

* [Browse Appcelerator libraries on NPM](https://www.npmjs.com/browse/keyword/appc-lib)

### `widget`
Alloy Widgets. Uses `widget.json` to populate the `package.json`, ignores that same file for the installer and uses `alloy-widget-<id>` as the package name.

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

## Test
To lint and run all tests:

```
$ [sudo] npm install -g grunt
$ npm install
$ npm test
```

To run a specific test by name (without `-test.js`):

```
$ grunt test --test <test>
```

## Contribute

To add new types of components, provide a PR with a [type](lib/types), [fixture](test/fixtures) and [test](test).

## Issues

Please report issues and features requests in the repo's [issue tracker](https://github.com/fokkezb/appc-npm/issues).

## License

Distributed under [MIT License](LICENSE).