var path = require('path');

var should = require('should');
var fs = require('fs-extra');

var subject = require('../lib/commands/generate');

var CMP_PATH = path.join(__dirname, '..', 'tmp');

describe('lib/commands/generate.js', function () {

	beforeEach(function () {

		fs.outputFileSync(path.join(CMP_PATH, 'widget.json'), JSON.stringify({
			id: 'com.foo'
		}));

	});

	afterEach(function () {
		fs.removeSync(CMP_PATH);
	});

	it('should generate for a widget', function (done) {

		subject({
			src: path.JOIN(CMP_PATH),
			type: 'widget'

		}, function (err) {

			if (err) {
				return done(err);
			}

			fs.existsSync(path.join(CMP_PATH, 'bin', 'install')).should.be.true;
			fs.existsSync(path.join(CMP_PATH, 'bin', 'type.js')).should.be.true;
			fs.readFileSync(path.join(CMP_PATH, 'bin', 'type.js'), {
				encoding: 'utf-8'
			}).should.be.a.String.eql(fs.readFileSync(path.join(__dirname, '..', 'lib', 'types', 'widget'), {
				encoding: 'utf-8'
			}));
			fs.existsSync(path.join(CMP_PATH, 'src', 'widget.json')).should.be.true;
			fs.existsSync(path.join(CMP_PATH, 'package.json')).should.be.true;
			fs.readFileSync(path.join(CMP_PATH, 'package.json'), {
				encoding: 'utf-8'
			}).should.be.a.String.eql(JSON.stringify({
				name: 'alloy-widget-com.foo',
				version: '1.0.0',
				scripts: {
					'postinstall': 'node ./bin/install'
				}
			}));

			return done();

		});
	});

});
