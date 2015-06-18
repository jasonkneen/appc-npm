var path = require('path');
var fs = require('fs');

var _ = require('underscore');
var semver = require('semver');
var async = require('async');

var PLATFORMS_DIRS = ['ios', 'iphone', 'android', 'mobileweb', 'blackberry', 'windows'];

exports.prefix = 'ti-module';

exports.analyze = function analyze(src, callback) {

	// assume we're in a platform dir
	return analyzePlatform(src, null, function (err, pkg) {

		// no (valid) manifest found
		if (err) {
			pkg = null;

			var pkgs = {};
			var errors = [];

			// try platform dirs
			return async.each(PLATFORMS_DIRS, function (platformDir, next) {

				return analyzePlatform(src, platformDir, function (err, pkg) {

					// valid manifest found
					if (!err) {
						pkgs[platformDir] = pkg;

					} else {
						errors.push('[' + path.join(src, platformDir) + '] ' + err);
					}

					return next();
				});

			}, function afterEach(err) {

				// no manifests founds
				if (_.size(pkgs) === 0) {
					return callback(new Error('Could not find a (valid) manifest:\n' + errors.join('\n')));
				}

				var version = [0, 0, 0];

				_.each(pkgs, function (platformPkg, platform) {
					var platformVersion = platformPkg.version.split('.');

					// sum version
					version[0] += parseInt(platformVersion[0] || 0, 10);
					version[1] += parseInt(platformVersion[1] || 0, 10);
					version[2] += parseInt(platformVersion[2] || 0, 10);

					if (!pkg) {
						pkg = platformPkg;

					} else {

						// append files
						pkg['appc-npm'].unzip.push(platformPkg['appc-npm'].unzip[0]);
						pkg.files.push(platformPkg.files[1]);
					}

				});

				pkg.version = version.join('.');

				return callback(null, pkg);
			});

		}

		return callback(null, pkg);
	});
};

function analyzePlatform(basePath, platformDir, callback) {
	var src = platformDir ? path.join(basePath, platformDir) : basePath;

	return fs.readFile(path.join(src, 'manifest'), {
		encoding: 'utf-8'
	}, function (err, data) {

		if (err) {
			return callback(new Error('Could not read manifest'));
		}

		var manifest = {};

		var lines = data.trim().split('\n');

		lines.forEach(function (line, index) {

			if (line.indexOf('#') === 0) {
				return;
			}

			var parts = line.split(':');

			manifest[parts[0]] = (parts[1] || '').trim();
		});

		if (!manifest.moduleid) {
			return callback(new Error('Could not find moduleid in manifest'));
		}

		if (!manifest.version) {
			return callback(new Error('Could not find version in manifest'));
		}

		if (!manifest.platform) {
			return callback(new Error('Could not find platform in manifest'));
		}

		var distPath = path.join('dist', manifest.moduleid + '-' + manifest.platform + '-' + manifest.version + '.zip');

		if (platformDir) {
			distPath = path.join(platformDir, distPath);
		}

		return fs.exists(path.join(basePath, distPath), function (exists) {

			if (!exists) {
				return callback(new Error('Could not find distribution: ' + distPath));
			}

			var pkg = _.extend(_.pick(manifest, 'version', 'description', 'author', 'license'), {
				name: exports.prefix + '-' + manifest.moduleid,
				'appc-npm': {
					target: {
						titanium: '/',
						alloy: '/'
					},
					unzip: [distPath]
				},

				// opposite of .npmignore
				files: ['appc-npm', distPath]
			});

			return callback(null, pkg);

		});

	});
}
