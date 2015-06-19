var path = require('path');
var child_process = require('child_process');

var _ = require('underscore');
var should = require('should');
var fs = require('fs-extra');

var main = require('../');
var type = require('../lib/types/module');

var FIXTURE_PATH_SINGLE = path.join(__dirname, 'fixtures', 'module-single');
var FIXTURE_PATH_MULTIPLE = path.join(__dirname, 'fixtures', 'module-multiple');
var TMP_PATH = path.join(__dirname, '..', 'tmp');
var NPM_PATH = path.join(TMP_PATH, 'npm', 'ti-module-com.foo');
var TIAPP_BEFORE = '<?xml version="1.0" encoding="UTF-8"?>\n<ti:app xmlns:ti="http://ti.appcelerator.org">\n\t<modules>\n\t\t<module platform="iphone" version="4.0.4">facebook</module>\n\t</modules>\n</ti:app>';
var TIAPP_BEFORE_CLOSED = '<?xml version="1.0" encoding="UTF-8"?>\n<ti:app xmlns:ti="http://ti.appcelerator.org">\n\t<modules />\n</ti:app>';
var TIAPP_BEFORE_MISSING = '<?xml version="1.0" encoding="UTF-8"?>\n<ti:app xmlns:ti="http://ti.appcelerator.org">\n</ti:app>';
var TIAPP_AFTER_CM = '<?xml version="1.0" encoding="UTF-8"?>\n<ti:app xmlns:ti="http://ti.appcelerator.org">\n\t<modules>\n\t\t<module platform="iphone" version="1.0.1">com.foo</module>\n\t</modules>\n</ti:app>';
var TIAPP_AFTER_SINGLE = '<?xml version="1.0" encoding="UTF-8"?>\n<ti:app xmlns:ti="http://ti.appcelerator.org">\n\t<modules>\n\t\t<module platform="iphone" version="4.0.4">facebook</module>\n\t\t<module platform="iphone" version="1.0.1">com.foo</module>\n\t</modules>\n</ti:app>';
var TIAPP_AFTER_MULTIPLE = '<?xml version="1.0" encoding="UTF-8"?>\n<ti:app xmlns:ti="http://ti.appcelerator.org">\n\t<modules>\n\t\t<module platform="iphone" version="4.0.4">facebook</module>\n\t\t<module platform="iphone" version="1.0.1">com.foo</module>\n\t\t<module platform="android" version="1.0.2">com.foo</module>\n\t</modules>\n</ti:app>';
var EXPECTED_ANALYZE_SINGLE = {
	name: 'com.foo',
	version: '1.0.1',
	description: 'description',
	author: 'author',
	license: 'license',
	'appc-npm': {
		target: {
			alloy: '/',
			titanium: '/',
		},
		tiapp: [{
			name: 'com.foo',
			platform: 'iphone',
			version: '1.0.1'
		}],
		unzip: ['dist/com.foo-iphone-1.0.1.zip']
	},
	files: ['appc-npm', 'dist/com.foo-iphone-1.0.1.zip']
};
var EXPECTED_PACKAGE_SINGLE = _.defaults({
	scripts: {
		postinstall: 'node ./appc-npm'
	},
	keywords: ['alloy', 'appc-npm', 'appcelerator', 'ti-module', 'titanium']
}, EXPECTED_ANALYZE_SINGLE);
var EXPECTED_ANALYZE_MULTIPLE = {
	name: 'com.foo',
	version: '2.0.3',
	description: 'description',
	author: 'author',
	license: 'license',
	'appc-npm': {
		target: {
			alloy: '/',
			titanium: '/',
		},
		tiapp: [{
			name: 'com.foo',
			platform: 'iphone',
			version: '1.0.1'
		}, {
			name: 'com.foo',
			platform: 'android',
			version: '1.0.2'
		}],
		unzip: ['android/dist/com.foo-android-1.0.2.zip', 'ios/dist/com.foo-iphone-1.0.1.zip']
	},
	files: ['android/dist/com.foo-android-1.0.2.zip', 'appc-npm', 'ios/dist/com.foo-iphone-1.0.1.zip']
};
var EXPECTED_PACKAGE_MULTIPLE = _.defaults({
	scripts: {
		postinstall: 'node ./appc-npm'
	},
	keywords: ['alloy', 'appc-npm', 'appcelerator', 'ti-module', 'titanium']
}, EXPECTED_ANALYZE_MULTIPLE);

describe('lib/types/module', function () {

	describe('#single', function () {

		before(function () {
			fs.copySync(FIXTURE_PATH_SINGLE, NPM_PATH);
			fs.writeFileSync(path.join(TMP_PATH, 'tiapp.xml'), TIAPP_BEFORE);
			fs.outputFileSync(path.join(TMP_PATH, 'modules', 'iphone', 'another', '1.0.0', 'manifest'));
			fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
				dependencies: {
					'ti-module-com.foo': './npm/ti-module-com.foo'
				}
			});
		});

		after(function () {
			fs.removeSync(TMP_PATH);
		});

		it('should analyze', function (done) {
			should.exist(type.prefix);

			type.prefix.should.be.a.String.eql('ti-module');

			return type.analyze(NPM_PATH, function (err, pkg) {

				if (err) {
					return done(err);
				}

				should.exist(pkg);

				pkg.should.be.an.Object.eql(EXPECTED_ANALYZE_SINGLE);

				return done();

			});

		});

		it('should package', function (done) {

			return main({
				src: NPM_PATH,
				type: 'module'

			}, function (err, pkg) {

				if (err) {
					return done(err);
				}

				should.exist(pkg);

				pkg.should.be.an.Object.eql(EXPECTED_PACKAGE_SINGLE);

				fs.existsSync(path.join(NPM_PATH, 'appc-npm')).should.be.true;
				fs.existsSync(path.join(NPM_PATH, 'package.json')).should.be.true;
				fs.readJsonSync(path.join(NPM_PATH, 'package.json')).should.be.an.Object.eql(EXPECTED_PACKAGE_SINGLE);

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

				fs.readFileSync(path.join(TMP_PATH, 'tiapp.xml'), {
					encoding: 'utf-8'
				}).should.be.a.String.eql(TIAPP_AFTER_SINGLE);
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'com.foo', '1.0.1', 'manifest')).should.be.true;
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'another', '1.0.0', 'manifest')).should.be.true;

				return done();
			});

		});

		it('should install with closed modules tag', function (done) {
			fs.writeFileSync(path.join(TMP_PATH, 'tiapp.xml'), TIAPP_BEFORE_CLOSED);

			child_process.execFile('npm', ['install'], {
				cwd: TMP_PATH
			}, function (error, stdout, stderr) {

				if (error) {
					return done(new Error(stderr));
				}

				fs.readFileSync(path.join(TMP_PATH, 'tiapp.xml'), {
					encoding: 'utf-8'
				}).should.be.a.String.eql(TIAPP_AFTER_CM);
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'com.foo', '1.0.1', 'manifest')).should.be.true;
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'another', '1.0.0', 'manifest')).should.be.true;

				return done();
			});

		});

		it('should install with missing modules tag', function (done) {
			fs.writeFileSync(path.join(TMP_PATH, 'tiapp.xml'), TIAPP_BEFORE_MISSING);

			child_process.execFile('npm', ['install'], {
				cwd: TMP_PATH
			}, function (error, stdout, stderr) {

				if (error) {
					return done(new Error(stderr));
				}

				fs.readFileSync(path.join(TMP_PATH, 'tiapp.xml'), {
					encoding: 'utf-8'
				}).should.be.a.String.eql(TIAPP_AFTER_CM);
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'com.foo', '1.0.1', 'manifest')).should.be.true;
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'another', '1.0.0', 'manifest')).should.be.true;

				return done();
			});

		});

	});

	describe('#multiple', function () {

		before(function () {
			fs.copySync(FIXTURE_PATH_MULTIPLE, NPM_PATH);
			fs.writeFileSync(path.join(TMP_PATH, 'tiapp.xml'), TIAPP_BEFORE);
			fs.outputFileSync(path.join(TMP_PATH, 'modules', 'iphone', 'another', '1.0.0', 'manifest'));
			fs.outputJsonSync(path.join(TMP_PATH, 'package.json'), {
				dependencies: {
					'ti-module-com.foo': './npm/ti-module-com.foo'
				}
			});
		});

		after(function () {
			fs.removeSync(TMP_PATH);
		});

		it('should analyze', function (done) {
			should.exist(type.prefix);

			type.prefix.should.be.a.String.eql('ti-module');

			return type.analyze(NPM_PATH, function (err, pkg) {

				if (err) {
					return done(err);
				}

				should.exist(pkg);

				pkg.should.be.an.Object.eql(EXPECTED_ANALYZE_MULTIPLE);

				return done();

			});

		});

		it('should package', function (done) {

			return main({
				src: NPM_PATH,
				type: 'module'

			}, function (err, pkg) {

				if (err) {
					return done(err);
				}

				should.exist(pkg);

				pkg.should.be.an.Object.eql(EXPECTED_PACKAGE_MULTIPLE);

				fs.existsSync(path.join(NPM_PATH, 'appc-npm')).should.be.true;
				fs.existsSync(path.join(NPM_PATH, 'package.json')).should.be.true;
				fs.readJsonSync(path.join(NPM_PATH, 'package.json')).should.be.an.Object.eql(EXPECTED_PACKAGE_MULTIPLE);

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

				fs.readFileSync(path.join(TMP_PATH, 'tiapp.xml'), {
					encoding: 'utf-8'
				}).should.be.a.String.eql(TIAPP_AFTER_MULTIPLE);
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'com.foo', '1.0.1', 'manifest')).should.be.true;
				fs.existsSync(path.join(TMP_PATH, 'modules', 'android', 'com.foo', '1.0.2', 'manifest')).should.be.true;
				fs.existsSync(path.join(TMP_PATH, 'modules', 'iphone', 'another', '1.0.0', 'manifest')).should.be.true;

				return done();
			});

		});

	});

});
