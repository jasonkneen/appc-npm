# Appcelerator NPM Distribution ![EXPERIMENTAL](https://img.shields.io/badge/status-experimental-green.svg?style=flat-square)
Package components for Appcelerator Titanium, Alloy and Arrow projects for distribution via NPM.

* [Browse Appcelerator Components on NPM](https://www.npmjs.com/browse/keyword/appc-npm)

> **NOTE:** Running `appc-npm <type>` for your component only updates/adds a `package.json` and `appc-npm` postinstall executable. It adds **no dependencies** and does not change your code.

## Install ![NPM](https://img.shields.io/npm/v/appc-npm.svg?style=flat-square)

```
$ [sudo] npm install -g appc-npm
```

## Package & Publish
Simply navigate to your Titanium module or library, Alloy widget, sync adapter, Arrow connector or other component and run the CLI with the command for that component:

```
$ cd mywidget

$ appc-npm widget
+ alloy-widget-myWidget@1.0.0

$ npm publish
+ alloy-widget-myWidget@1.0.0
```

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

### `widget`
Alloy Widgets. Uses `widget.json` to populate the `package.json`, ignores that same file for the installer and uses `alloy-widget-<id>` as the package name.

* [Browse Alloy widgets on NPM](https://www.npmjs.com/browse/keyword/alloy-widget)

### `sync`
Alloy sync adapters. Searches for the first `.js` and uses `alloy-sync-<filename>` as the package name and `1.0.0` for the version. All other files are ignored for the installer.

* [Browse Alloy sync adapters on NPM](https://www.npmjs.com/browse/keyword/alloy-sync)

### `theme`
Alloy themes. Uses `alloy-sync-<dirname>` as the package name and `1.0.0` for the version. It ignores the generated `package.json` for the installer.

* [Browse Alloy themes adapters on NPM](https://www.npmjs.com/browse/keyword/alloy-theme)

### `lib`
Titanium, Alloy or Arrow CommonJS libraries. Searches for the first `.js` and uses `alloy-sync-<filename>` as the package name and `1.0.0` for the version. All other files are ignored for the installer.

* [Browse Appcelerator libraries on NPM](https://www.npmjs.com/browse/keyword/appc-lib)

### `block`
Arrow post or pre-blocks. Searches for the first `.js` to determine the base path and adds that file to the list of paths to copy to the project. The default package name is `arrow-block-<filename>` and version is `1.0.0`.

* [Browse Arrow blocks on NPM](https://www.npmjs.com/browse/keyword/arrow-block)

### `connector`
Arrow connectors. Searches for `package.json` to determine the target for the installer and will update the file with the `postinstall` script and `appc-npm` property, leaving the name and version as it is.

* [Browse Arrow connectors on NPM](https://www.npmjs.com/browse/keyword/arrow-connector)

### `module` ![TODO](https://img.shields.io/badge/TO-DO-green.svg?style=flat-square)
Titanium modules. Searches for the most recent ZIP file and adds that file to the `files` field of the `package.json` so that only that file and our installer will be published to NPM. It also reads the `manifest` to use in the default package, which is `ti-module-<id>`, and for the version.

## Test

```
$ npm install
$ npm test
```

## Contribute

To add new types of components, provide a PR with a [type](lib/types), [fixture](test/fixtures) and [test](test).

## Issues

Please report issues and features requests in the repo's [issue tracker](https://github.com/fokkezb/appc-npm/issues).

## License

Distributed under [MIT License](LICENSE).