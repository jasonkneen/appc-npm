var path = require('path');

exports.prefix = 'arrow-connector';

exports.analyze = function analyze(src, callback) {
	var packageJson;

	try {
		packageJson = require(path.join(src, 'package.json'));
	} catch (e) {
		return callback(new Error('Could not find package.json'));
	}

	if (!packageJson.name) {
		return callback(new Error('Could not find name in package.json'));
	}

	var pkg = {
		'appc-npm': {
			target: {
				arrow: 'connectors/' + packageJson.name
			}
		}
	};

	return callback(null, pkg);
};
