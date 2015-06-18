var path = require('path');
var child_process = require('child_process');

var _ = require('underscore');
var should = require('should');
var fs = require('fs-extra');

var main = require('../');
var type = require('../lib/types/connector');

var FIXTURE_PATH = path.join(__dirname, 'fixtures', 'connector');
var TMP_PATH = path.join(__dirname, '..', 'tmp');
var NPM_PATH = path.join(TMP_PATH, 'npm', 'com.foo');
var EXPECTED_ANALYZE = {
	'appc-npm': {
		target: {
			arrow: 'connectors/com.foo'
		}
	}
};
var EXPECTED_PACKAGE = _.defaults({
	name: 'com.foo',
	version: '1.0.1',
	scripts: {
		postinstall: 'node ./appc-npm'
	},
	keywords: ['appc-npm', 'appcelerator', 'arrow', 'arrow-connector']
}, EXPECTED_ANALYZE);

describe('lib/types/connector', function () {

	before(function () {
		fs.copySync(FIXTURE_PATH, NPM_PATH);
		fs.outputFileSync(path.join(TMP_PATH, 'appc.json'));
		fs.outputFileSync(path.join(TMP_PATH, 'connectors', 'com.bar', 'package.json'));
		fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
			dependencies: {
				'com.foo': './npm/com.foo'
			}
		});
	});

	after(function () {
		fs.removeSync(TMP_PATH);
	});

	it('should analyze', function (done) {
		should.exist(type.prefix);

		type.prefix.should.be.a.String.eql('arrow-connector');

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
			type: 'connector'

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

			if (error) {
				return done(new Error(stderr));
			}

			fs.existsSync(path.join(TMP_PATH, 'connectors', 'com.foo', 'package.json')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'connectors', 'com.bar', 'package.json')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'connectors', 'com.foo', 'appc-npm')).should.not.be.true;

			return done();
		});

	});

});
