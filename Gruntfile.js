module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 30000,
				reporter: 'spec',
				ignoreLeaks: false
			},
			src: ['test/**/*-test.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['*.js', 'templates/install', 'templates/**/*.js', 'lib/**/*.js', 'bin/appc-npm']
		},
		kahvesi: {
			src: ['test/**/*.js']
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
