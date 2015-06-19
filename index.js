var path = require('path');

var fs = require('fs-extra');
var async = require('async');
var _ = require('underscore');
var semver = require('semver');

module.exports = function (opts, callback) {

	if (arguments.length === 1) {
		callback = opts;
		opts = {};

	} else {
		opts = opts || {};
	}

	var src = opts.src || process.cwd();
	var type = opts.type;

	var newPkg;
	var pkg = {};

	var packagePath = path.join(src, 'package.json');

	return async.series({

		validate: function (next) {

			if (!type) {
				return next(new Error('Type is missing'));
			}

			if (!src) {
				return next(new Error('Source is missing'));
			}

			try {
				type = require(path.join(__dirname, 'lib', 'types', type));

			} catch (e) {
				return next(new Error('Unknown type: ' + type));
			}

			return fs.stat(src, function (err, stats) {

				if (err) {
					return next(new Error('Could not find source: ' + src));
				}

				if (!stats.isDirectory()) {
					return next(new Error('Source is not a directory: ' + src));
				}

				return next();

			});

		},

		analyze: function (next) {

			return type.analyze(src, function (err, res) {

				if (err) {
					return next(err);
				}

				newPkg = res;

				return next();
			});
		},

		readPackage: function (next) {

			return fs.exists(packagePath, function (exists) {

				if (!exists) {
					return next();
				}

				return fs.readJson(packagePath, function (err, json) {

					if (err) {
						return next(new Error('Failed to read package.json'));
					}

					pkg = json;

					return next();
				});

			});

		},

		updatePackage: function (next) {

			if (newPkg.files) {

				// remove old installer and zips from whitelist
				pkg.files = (_.isArray(pkg.files) ? _.filter(pkg.files, function (file) {
					return (file !== 'appc-npm' && !/\.zip$/.test(file));
				}) : []).concat(newPkg.files);

				// sort for testing
				pkg.files.sort();
			}

			// update version if it is greater
			if (newPkg.version && (!pkg.version || semver.lt(pkg.version, newPkg.version))) {
				pkg.version = newPkg.version;
			} else if (!pkg.version) {
				pkg.version = '1.0.0';
			}

			if (!_.isObject(pkg['appc-npm'])) {
				pkg['appc-npm'] = {};
			}

			// overwrite unzip
			if (newPkg['appc-npm'].unzip) {
				pkg['appc-npm'].unzip = newPkg['appc-npm'].unzip;

				// sort for testing
				pkg['appc-npm'].unzip.sort();
			}

			// overwrite tiapp
			if (newPkg['appc-npm'].tiapp) {
				pkg['appc-npm'].tiapp = newPkg['appc-npm'].tiapp;

				// sort for testing
				pkg['appc-npm'].tiapp.sort();
			}

			// overwrite config
			if (newPkg['appc-npm'].config) {
				pkg['appc-npm'].config = newPkg['appc-npm'].config;
			}

			// overwrite target
			if (newPkg['appc-npm'].target) {
				pkg['appc-npm'].target = newPkg['appc-npm'].target;
			}

			// do not overwrite ignore
			if (newPkg['appc-npm'].ignore && !pkg['appc-npm'].ignore) {
				pkg['appc-npm'].ignore = newPkg['appc-npm'].ignore;
			}

			// sort for testing
			if (pkg['appc-npm'].ignore) {
				pkg['appc-npm'].ignore.sort();
			}

			// don't overwrite other keys
			_.defaults(pkg, newPkg);

			// fallback name
			if (!pkg.name) {
				pkg.name = type.prefix + '-' + path.basename(src);
			}

			// name must be in lower case
			pkg.name = pkg.name.toLowerCase();

			// do not overwrite scripts
			if (typeof pkg.scripts !== 'object') {
				pkg.scripts = {};
			}

			// do not overwrite postinstall
			if (!pkg.scripts.postinstall) {
				pkg.scripts.postinstall = 'node ./appc-npm';
			}

			// ensure keywords
			var keywords = ['appcelerator', 'appc-npm', type.prefix];

			if (_.isObject(pkg['appc-npm'])) {
				keywords = keywords.concat(_.keys(pkg['appc-npm'].target));
			} else {
				keywords.push('arrow', 'alloy', 'titanium');
			}

			if (!_.isArray(pkg.keywords)) {
				pkg.keywords = keywords;

			} else {

				keywords.forEach(function (keyword) {

					if (pkg.keywords.indexOf(keyword) === -1) {
						pkg.keywords.push(keyword);
					}

				});
			}

			// sort for better testing
			pkg.keywords.sort();

			return next();
		},

		writePackage: function (next) {

			return fs.outputJson(packagePath, pkg, function (err) {

				if (err) {
					return next(new Error('Failed to write package.json'));
				}

				return next();
			});

		},

		writeIgnore: function (next) {
			var NPMignorePath = path.join(src, '.npmignore');
			var ignore = pkg['appc-npm'].ignore;

			// nothing to ignore
			if (!_.isArray(ignore) || ignore.length === 0) {
				return next();
			}

			var ignoreForNPM = _.without(ignore, 'package.json', 'appc-npm');

			// nothing to ignore for NPM
			if (ignoreForNPM.length === 0) {
				return next();
			}

			return fs.exists(NPMignorePath, function (exists) {

				// don't overwrite
				if (exists) {
					return next();
				}

				return fs.outputFile(NPMignorePath, ignoreForNPM.join('\n'), function (err) {

					if (err) {
						return next(new Error('Failed to write .npmignore'));
					}

					return next();
				});

			});

		},

		copyInstaller: function (next) {

			return fs.copy(path.join(__dirname, 'assets', 'appc-npm'), path.join(src, 'appc-npm'), function (err) {

				if (err) {
					return next(new Error('Failed to copy the installer'));
				}

				return next();
			});

		}

	}, function (err) {

		if (err) {
			return callback(err);
		}

		return callback(null, pkg);
	});
};
