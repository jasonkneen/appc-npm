var path = require('path');
var child_process = require('child_process');

var _ = require('underscore');
var should = require('should');
var fs = require('fs-extra');

var main = require('../');
var type = require('../lib/types/block');

var FIXTURE_PATH = path.join(__dirname, 'fixtures', 'block');
var TMP_PATH = path.join(__dirname, '..', 'tmp');
var NPM_PATH = path.join(TMP_PATH, 'npm', 'arrow-block-geocode');
var EXPECTED_ANALYZE = {
	name: 'arrow-block-geocode',
	'appc-npm': {
		target: {
			arrow: 'blocks/'
		},
		ignore: ['README.md', 'package.json']
	}
};
var EXPECTED_PACKAGE = _.defaults({
	name: 'arrow-block-geocode',
	version: '1.0.0',
	scripts: {
		postinstall: 'node ./appc-npm'
	},
	keywords: ['appc-npm', 'appcelerator', 'arrow', 'arrow-block']
}, EXPECTED_ANALYZE);
var EXPECTED_IGNORE = _.without(EXPECTED_PACKAGE['appc-npm'].ignore, 'package.json').join('\n');

describe('lib/types/block', function () {

	before(function () {
		fs.copySync(FIXTURE_PATH, NPM_PATH);
		fs.outputFileSync(path.join(TMP_PATH, 'appc.json'));
		fs.outputFileSync(path.join(TMP_PATH, 'blocks', 'another.js'));
		fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
			dependencies: {
				'arrow-block-geocode': './npm/arrow-block-geocode'
			}
		});
	});

	after(function () {
		fs.removeSync(TMP_PATH);
	});

	it('should analyze', function (done) {
		should.exist(type.prefix);

		type.prefix.should.be.a.String().eql('arrow-block');

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
			type: 'block'

		}, function (err, pkg) {

			if (err) {
				return done(err);
			}

			should.exist(pkg);

			pkg.should.be.an.Object().eql(EXPECTED_PACKAGE);

			fs.existsSync(path.join(NPM_PATH, 'appc-npm')).should.be.true();

			fs.existsSync(path.join(NPM_PATH, '.npmignore')).should.be.true();
			fs.readFileSync(path.join(NPM_PATH, '.npmignore'), {
				encoding: 'utf-8'
			}).should.be.a.String().eql(EXPECTED_IGNORE);
			
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

			fs.existsSync(path.join(TMP_PATH, 'blocks', 'geocode.js')).should.be.true();
			fs.existsSync(path.join(TMP_PATH, 'blocks', 'another.js')).should.be.true();
			fs.existsSync(path.join(TMP_PATH, 'blocks', 'README.md')).should.not.be.true();
			fs.existsSync(path.join(TMP_PATH, 'blocks', 'package.json')).should.not.be.true();
			fs.existsSync(path.join(TMP_PATH, 'blocks', 'appc-npm')).should.not.be.true();

			return done();
		});

	});

});
