var path = require('path');
var child_process = require('child_process');

var _ = require('underscore');
var should = require('should');
var fs = require('fs-extra');

var main = require('../');
var type = require('../lib/types/lib');

var FIXTURE_PATH = path.join(__dirname, 'fixtures', 'lib');
var TMP_PATH = path.join(__dirname, '..', 'tmp');
var NPM_PATH = path.join(TMP_PATH, 'npm', 'appc-lib-helper');
var EXPECTED_ANALYZE = {
	name: 'appc-lib-helper',
	'appc-npm': {
		target: {
			alloy: 'app/lib/',
			titanium: 'Resources/',
			arrow: 'lib/'
		},
		ignore: ['package.json', 'README.md']
	}
};
var EXPECTED_PACKAGE = _.defaults({
	version: '1.0.0',
	scripts: {
		postinstall: 'node ./appc-npm'
	},
	keywords: ['appc-npm', 'appc-lib']
}, EXPECTED_ANALYZE);

describe('lib/types/lib', function () {

	before(function () {
		fs.copySync(FIXTURE_PATH, NPM_PATH);
		fs.outputFileSync(path.join(TMP_PATH, 'app', 'controllers', 'index.js'));
		fs.outputFileSync(path.join(TMP_PATH, 'app', 'lib', 'another.js'));
		fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
			dependencies: {
				'appc-lib-helper': './npm/appc-lib-helper'
			}
		});
	});

	after(function () {
		fs.removeSync(TMP_PATH);
	});

	it('should analyze', function (done) {
		should.exist(type.prefix);

		type.prefix.should.be.a.String.eql('appc-lib');

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
			type: 'lib'

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

	it('should install under Alloy', function (done) {

		child_process.execFile('npm', ['install'], {
			cwd: TMP_PATH
		}, function (error, stdout, stderr) {

			if (error) {
				return done(new Error(stderr));
			}

			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'helper.js')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'another.js')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'README.md')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'package.json')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'appc-npm')).should.not.be.true;

			return done();
		});

	});

	it('should install under Titanium', function (done) {

		// clean up Alloy
		fs.removeSync(path.join(TMP_PATH, 'app'));
		fs.removeSync(path.join(TMP_PATH, 'node_modules'));

		fs.outputFileSync(path.join(TMP_PATH, 'tiapp.xml'));
		fs.outputFileSync(path.join(TMP_PATH, 'Resources', 'app.js'));

		child_process.execFile('npm', ['install'], {
			cwd: TMP_PATH
		}, function (error, stdout, stderr) {

			if (error) {
				return done(new Error(stderr));
			}

			fs.existsSync(path.join(TMP_PATH, 'Resources', 'helper.js')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'Resources', 'app.js')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'Resources', 'README.md')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'Resources', 'package.json')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'Resources', 'appc-npm')).should.not.be.true;

			return done();
		});

	});

	it('should install under Arrow', function (done) {

		// clean up Titanium
		fs.removeSync(path.join(TMP_PATH, 'Resources'));
		fs.removeSync(path.join(TMP_PATH, 'tiapp.xml'));
		fs.removeSync(path.join(TMP_PATH, 'node_modules'));

		fs.outputFileSync(path.join(TMP_PATH, 'appc.json'));
		fs.outputFileSync(path.join(TMP_PATH, 'lib', 'auth.js'));

		child_process.execFile('npm', ['install'], {
			cwd: TMP_PATH
		}, function (error, stdout, stderr) {

			if (error) {
				return done(new Error(stderr));
			}

			fs.existsSync(path.join(TMP_PATH, 'lib', 'helper.js')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'lib', 'auth.js')).should.be.true;
			fs.existsSync(path.join(TMP_PATH, 'lib', 'README.md')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'lib', 'package.json')).should.not.be.true;
			fs.existsSync(path.join(TMP_PATH, 'lib', 'appc-npm')).should.not.be.true;

			return done();
		});

	});

});
