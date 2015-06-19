var path = require('path');
var child_process = require('child_process');

var _ = require('underscore');
var should = require('should');
var fs = require('fs-extra');

var main = require('../');
var type = require('../lib/types/sync');

var FIXTURE_PATH = path.join(__dirname, 'fixtures', 'sync');
var TMP_PATH = path.join(__dirname, '..', 'tmp');
var NPM_PATH = path.join(TMP_PATH, 'npm', 'alloy-sync-restapi');
var EXPECTED_ANALYZE = {
	name: 'alloy-sync-restapi',
	'appc-npm': {
		target: {
			alloy: 'app/lib/alloy/sync/'
		},
		ignore: ['README.md', 'package.json']
	}
};
var EXPECTED_PACKAGE = _.defaults({
	version: '1.0.0',
	scripts: {
		postinstall: 'node ./appc-npm'
	},
	keywords: ['alloy', 'alloy-sync', 'appc-npm', 'appcelerator']
}, EXPECTED_ANALYZE);

describe('lib/types/sync', function () {

	before(function () {
		fs.copySync(FIXTURE_PATH, NPM_PATH);
		fs.outputFileSync(path.join(TMP_PATH, 'app', 'controllers', 'index.js'));
		fs.outputFileSync(path.join(TMP_PATH, 'app', 'lib', 'alloy', 'sync', 'another.js'));
		fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
			dependencies: {
				'alloy-sync-restapi': './npm/alloy-sync-restapi'
			}
		});
	});

	after(function () {
		// fs.removeSync(TMP_PATH);
	});

	it('should analyze', function (done) {
		should.exist(type.prefix);

		type.prefix.should.be.a.String().eql('alloy-sync');

		return type.analyze(NPM_PATH, function (err, pkg) {

			if (err) {
				return done(err);
			}

			should.exist(pkg);

			pkg.should.be.an.Object().eql(EXPECTED_ANALYZE);

			return done();

		});

	});

	it('should package', function (done) {

		return main({
			src: NPM_PATH,
			type: 'sync'

		}, function (err, pkg) {

			if (err) {
				return done(err);
			}

			should.exist(pkg);

			pkg.should.be.an.Object().eql(EXPECTED_PACKAGE);

			fs.existsSync(path.join(NPM_PATH, 'appc-npm')).should.be.true();
			fs.existsSync(path.join(NPM_PATH, 'package.json')).should.be.true();
			fs.readJsonSync(path.join(NPM_PATH, 'package.json')).should.be.an.Object().eql(EXPECTED_PACKAGE);

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

			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'alloy', 'sync', 'restapi.js')).should.be.true();
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'alloy', 'sync', 'another.js')).should.be.true();
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'alloy', 'sync', 'README.md')).should.not.be.true();
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'alloy', 'sync', 'package.json')).should.not.be.true();
			fs.existsSync(path.join(TMP_PATH, 'app', 'lib', 'alloy', 'sync', 'appc-npm')).should.not.be.true();

			return done();
		});

	});

});
