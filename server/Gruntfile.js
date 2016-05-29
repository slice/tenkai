// Gruntfile.js
// 
// Used for running Grunt tasks.
// Essential for compiling the server.

module.exports = function(grunt) {
	// Loads all Grunt tasks.
	// This is very handy because this means we don't
	// have to register them manually.
	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		// Compilation + packing.
		// Code base uses ES6 (ECMAScript2015), compilation
		// with Babelify via Browserify (used for packing.)
		browserify: {
			options: {
				transform: [
					["babelify", {
						presets: ["es2015"],
						sourceType: "module"
					}]
				]
			},
			server: {
				files: {
					// The main file is located
					// in src/tenkai.js.
					"dist/tenkai.js": "src/tenkai.js"
				}
			}
		},

		// Uglify; decreases code size
		// for production use.
		uglify: {
			options: {
				mangle: false
			},
			server: {
				files: {
					// Simply minify the already built
					// tenkai.js located in the dist/
					// directory.
					"dist/tenkai.min.js": "dist/tenkai.js"
				}
			}
		}
	});

	grunt.registerTask("default", ["browserify", "uglify"]);
};
