var path = require('path');
var fs = require('fs');

exports.prefix = 'appc-lib';

exports.analyze = function analyze(src, callback) {

	return fs.readdir(src, function (err, files) {

		if (err) {
			return callback(new Error('Could not find files'));
		}

		var name;
		var ignore = ['package.json'];

		for (var i = 0, l = files.length; i < l; i++) {

			if (!name && path.extname(files[i]) === '.js') {
				name = exports.prefix + '-' + files[i].substr(0, files[i].length - 3);
			} else {
				ignore.push(files[i]);
			}
		}

		var pkg = {
			name: name,
			'appc-npm': {
				target: {
					alloy: 'app/lib/',
					titanium: 'Resources/',
					arrow: 'lib/'
				},
				ignore: ignore
			}
		};

		return callback(null, pkg);
	});
};
