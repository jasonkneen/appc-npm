var path = require('path');
var child_process = require('child_process');

var should = require('should');
var fs = require('fs-extra');

var PRJ_PATH = path.join(__dirname, '..', 'tmp');
var PKG_PATH = path.join(PRJ_PATH, 'node_modules', 'alloy-widget-com.foo');

describe('templates/install', function () {

	beforeEach(function () {

		fs.outputFileSync(path.join(PRJ_PATH, 'package.json'), JSON.stringify({
			dependencies: {
				'alloy-widget-com.foo': '*'
			}
		}));

		fs.outputFileSync(path.join(PKG_PATH, 'package.json'), JSON.stringify({
			name: 'alloy-widget-com.foo',
			version: '1.0.0',
			scripts: {
				'postinstall': 'node ./bin/install'
			}
		}));

		fs.outputFileSync(path.join(PKG_PATH, 'src', 'widget.json'), JSON.stringify({
			id: 'com.foo'
		}));

		fs.outputFileSync(path.join(PRJ_PATH, 'app', 'controllers', 'index.js'));

		fs.copySync(path.join(__dirname, '..', 'templates', 'install'), path.join(PKG_PATH, 'bin', 'install'));
		fs.copySync(path.join(__dirname, '..', 'lib', 'types', 'alloy-widget.js'), path.join(PKG_PATH, 'bin', 'type.js'));

	});

	afterEach(function () {
		fs.removeSync(PRJ_PATH);
	});

	it('should install', function (done) {

		child_process.execFile('npm', ['install'], {
			cwd: PKG_PATH
		}, function (error, stdout, stderr) {

			if (error) {
				return done(new Error(stderr));
			}

			fs.existsSync(path.join(PRJ_PATH, 'app', 'widgets', 'com.foo', 'widget.json')).should.be.true;

			return done();
		});

	});

});
