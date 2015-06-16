var path = require('path');
var fs = require('fs');

var _ = require('underscore');

exports.prefix = 'alloy-widget';

exports.analyze = function analyze(src, callback) {
	var widgetJson;

	try {
		widgetJson = require(path.join(src, 'widget.json'));
	} catch (e) {
		return callback(new Error('Could not find widget.json'));
	}

	if (!widgetJson.id) {
		return callback(new Error('Could not find id in widget.json'));
	}

	if (!widgetJson.version) {
		return callback(new Error('Could not find version in widget.json'));
	}

	var pkg = _.extend(_.pick(widgetJson, 'version', 'description', 'author', 'license'), {
		name: exports.prefix + '-' + widgetJson.id,
		'appc-npm': {
			target: {
				alloy: 'app/widgets/' + widgetJson.id
			},
			ignore: ['package.json']
		}
	});

	if (widgetJson.tags) {
		pkg.keywords = widgetJson.tags.split(/\s*,\s*/);
	}

	return callback(null, pkg);
};
