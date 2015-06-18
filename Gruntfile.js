module.exports = function (grunt) {
	var test = grunt.option('test') || '*';

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 30000,
				reporter: 'spec',
				ignoreLeaks: false
			},
			src: ['test/' + test + '-test.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['*.js', 'assets/appc-npm', 'bin/appc-npm', 'lib/**/*.js']
		},
		kahvesi: {
			src: ['test/' + test + '-test.js']
		},
		clean: ['tmp']
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-kahvesi');

	// register tasks
	grunt.registerTask('lint', 'jshint');
	grunt.registerTask('test', ['lint', 'clean', 'mochaTest', 'clean']);
	grunt.registerTask('cover', ['kahvesi', 'clean']);

	grunt.registerTask('default', 'test');
};
