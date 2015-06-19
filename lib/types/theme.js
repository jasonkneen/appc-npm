var path = require('path');

exports.prefix = 'alloy-theme';

exports.analyze = function analyze(src, callback) {
	var parentDir = path.basename(src);

	var pkg = {
		name: 'alloy-theme-' + parentDir,
		'appc-npm': {
			target: {
				alloy: 'app/themes/' + parentDir
			},
			ignore: ['package.json']
		}
	};

	return callback(null, pkg);
};
