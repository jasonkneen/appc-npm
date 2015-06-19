var path = require('path');

var registry = require('npm-stats')();
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
		name: widgetJson.id,
		'appc-npm': {
			target: {
				alloy: 'app/widgets/' + widgetJson.id.toLowerCase()
			},
			ignore: ['package.json'],
			config: {}
		}
	});

	pkg['appc-npm'].config[widgetJson.id] = widgetJson.version;

	if (widgetJson.tags) {

		// sort for testing
		pkg.keywords = widgetJson.tags.split(/\s*,\s*/).sort();
	}

	// check availability
	return registry.module(pkg.name).info(function (err, data) {

		// already exists
		if (!err || err.message !== 'missing') {
			pkg.name = exports.prefix + '-' + pkg.name;
		}

		return callback(null, pkg);
	});
};
