var path = require('path');
var child_process = require('child_process');

var _ = require('underscore');
var should = require('should');
var fs = require('fs-extra');

var main = require('../');
var type = require('../lib/types/widget');

var FIXTURE_PATH = path.join(__dirname, 'fixtures', 'com.foo');
var TMP_PATH = path.join(__dirname, '..', 'tmp');
var NPM_PATH = path.join(TMP_PATH, 'npm', 'alloy-widget-com.foo');
var EXPECTED_ANALYZE = {
	name: 'alloy-widget-com.foo',
	version: '1.0.1',
	description: 'description',
	author: 'author',
	license: 'license',
	keywords: ['foo', 'bar'],
	'appc-npm': {
		target: {
			alloy: 'app/widgets/com.foo'
		},
		ignore: ['package.json']
	}
};
var EXPECTED_PACKAGE = _.defaults({
	scripts: {
		postinstall: 'node ./appc-npm'
	}
}, EXPECTED_ANALYZE);

describe('lib/types/widget', function () {

	before(function () {
		fs.copySync(FIXTURE_PATH, NPM_PATH);
		fs.outputFileSync(path.join(TMP_PATH, 'app', 'controllers', 'index.js'));
		fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
			dependencies: {
				'alloy-widget-com.foo': './npm/alloy-widget-com.foo'
			}
		});
	});

	after(function () {
		fs.removeSync(TMP_PATH);
	});

	it('should analyze', function (done) {
		should.exist(type.prefix);

		type.prefix.should.be.a.String.eql('alloy-widget-');

		return type.analyze(NPM_PATH, function (err, pkg) {

			if (err) {
				return done(err);
			}

			should.exist(pkg);

			pkg.should.be.an.Object.eql(EXPECTED_ANALYZE);

			return done();

		});

	});

	it('should package', function (done) {

		return main({
			src: NPM_PATH,
			type: 'widget'

		}, function (err, pkg) {

			if (err) {
				return done(err);
			}

			should.exist(pkg);

			pkg.should.be.an.Object.eql(EXPECTED_PACKAGE);

			fs.existsSync(path.join(NPM_PATH, 'appc-npm')).should.be.true;
			fs.existsSync(path.join(NPM_PATH, 'package.json')).should.be.true;
			fs.readJsonSync(path.join(NPM_PATH, 'package.json')).should.be.an.Object.eql(EXPECTED_PACKAGE);

			return done();
		});
	});

	it('should install', function (done) {

		child_process.execFile('npm', ['install'], {
			cwd: TMP_PATH
		}, function (error, stdout, stderr) {

			console.log(stdout);

			if (error) {
				return done(new Error(stderr));
			}

			fs.existsSync(path.join(TMP_PATH, 'app', 'widgets', 'com.foo', 'widget.json')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'app', 'widgets', 'com.foo', 'package.json')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'app', 'widgets', 'com.foo', 'appc-npm')).should.not.be.true;

			return done();
		});

	});

});
