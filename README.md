# Appcelerator NPM Distribution
Package components for Appcelerator Titanium, Alloy and Arrow projects for distribution and dependencies via NPM.

## Install

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

Create or update the `package.json` for your project:

```
{
	...
	"dependencies": {
		"alloy-widget-myWidget": "1.0.0"
	}
}
```

Install the dependencies:

```
$ npm install

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
$ npm install

> alloy-widget-myWidget@1.0.0 postinstall /Users/fokkezb/myProject/node_modules/alloy-widget-myWidget
> node ./appc-npm

> ti-lib-xp.ui@1.0.0 postinstall /Users/fokkezb/myProject/node_modules/alloy-widget-myWidget/node_modules/ti-lib/xp.ui
> node ./appc-npm

alloy-widget-myWidget@1.0.0 node_modules/alloy-widget-myWidget
├── ti-lib-xp.ui@1.0.0
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

### DONE: `widget`
Alloy Widgets. Searches for `widget.json` to determine the base path and adds `controllers`, `views`, `styles`, `lib`, `assets` and `i18n` directories to the list of paths to copy to the project. The default package name is `alloy-widget-<id>` and the version is read from `widget.json` as well.

### TODO: `sync`
Alloy sync adapters. Searches for the first `.js` to determine the base path and adds that file to the list of paths to copy to the project. The default package name is `alloy-sync-<filename>` and version is `1.0.0`.

### TODO `lib`
Titanium, Alloy or Arrow CommonJS libraries. Searches for the first `.js` to determine the base path and adds that file to the list of paths to copy to the project. The default package name is `appc-lib-<filename>` and version is `1.0.0`.

### TODO: `module`
Titanium modules. Searches for the most recent ZIP file and adds that file to the `files` field of the `package.json` so that only that file and our installer will be published to NPM. It also reads the `manifest` to use in the default package, which is `ti-module-<id>`, and for the version.

### TODO: `block`
Arrow post or pre-blocks. Searches for the first `.js` to determine the base path and adds that file to the list of paths to copy to the project. The default package name is `arrow-block-<filename>` and version is `1.0.0`.

### TODO: `connector`
Arrow connectors. Searches for `appc.json` to determine the base path and adds that same directory to the list of paths to copy. The existing `package.json` is updated with the `postinstall` script and `appc-npm` property containing the list of paths.