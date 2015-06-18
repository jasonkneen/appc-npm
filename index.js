var path = require('path');

var fs = require('fs-extra');
var async = require('async');
var _ = require('underscore');

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

			// remove old installer and zips from whitelist
			if (pkg.files) {

				// TODO fix this

				pkg.files = _.filter(pkg.files, function (file) {
					return (file !== 'appc-npm' && !/\.zip$/.test(file));
				}).concat(newPkg.files);
			}

			// don't overwrite
			_.defaults(pkg, newPkg);

			// do overwrite version, falling back to 1.0.0
			pkg.version = newPkg.version || pkg.version || '1.0.0';

			// do overwrite unzip
			if (pkg['appc-npm'].unzip) {
				pkg['appc-npm'].unzip = newPkg['appc-npm'].unzip;
			}

			// fallback name
			pkg.name = pkg.name || type.prefix + '-' + path.basename(src);

			if (typeof pkg.scripts !== 'object') {
				pkg.scripts = {};
			}

			// don't overwrite postinstall
			if (!pkg.scripts.postinstall) {
				pkg.scripts.postinstall = 'node ./appc-npm';
			}

			// ensure keywords

			var keywords = ['appcelerator', 'appc-npm', type.prefix];

			if (typeof pkg['appc-npm'].target === 'string') {
				keywords.push('arrow', 'alloy', 'titanium');
			} else {
				keywords = keywords.concat(_.keys(pkg['appc-npm'].target));
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
