/*jshint node:true, laxbreak:true */
'use strict';

module.exports = function(grunt) {

    // -- Plugins --------------------------------------------------------------

    // Intelligently autoloads `grunt-*` plugins from the package dependencies.
    require('load-grunt-tasks')(grunt);

    // Adds better support for defining options.
    require('nopt-grunt')(grunt);

    // Uncomment the next line to have grunt report the time it takes for tasks
    // to run so targets for optimization may be identified.
    // require('time-grunt')(grunt);

    // -- Options --------------------------------------------------------------

    grunt.initOptions({
        prod: {
            info: 'Whether this is a production build.',
            type: Boolean
        },
        stage: {
            info: 'Whether this is a staging build.',
            type: Boolean
        },
        maps: {
            info: 'Whether to generate source maps for compressed files.',
            type: Boolean
        }
    });

    // All builds are considered to be development builds, unless they're not.
    grunt.option('dev', !grunt.option('prod') && !grunt.option('stage'));

    // -- Configuration --------------------------------------------------------

    grunt.initConfig({

        // -- Metadata ---------------------------------------------------------

        // This will load the `package.json` file so we can have access to the
        // project metadata such as name and version number.
        pkg: require('./package.json'),

        // This will load the `env.js` file so we can have access to the
        // project environment configuration and constants.
        env: require('./env'),

        // A comment block that will be prefixed to all our minified code files.
        // Gets the name and version from the above loaded `package.json` file.
        // How to use: '<%= banner %>'
        banner: [
            '/*!',
            ' * <%= pkg.name %> v<%= pkg.version %>' + (grunt.option('dev') ? ' (dev)' : ''),
            ' * <%= pkg.description %>',
            ' *',
            ' * Copyright(c): <%= grunt.template.today("yyyy") %>',
            ' * Build Date: <%= grunt.template.today("yyyy-mm-dd") %>',
            ' */\n'
        ].join('\n'),

        // -- Utility Tasks ----------------------------------------------------

        // Automatically removes generated files and directories. Useful for
        // rebuilding the project with fresh copies of everything.
        clean: {
            options: {
                // Uncomment the next line to allow deletion of folders outside
                // the current working dir (CWD). Use with caution.
                // force: true
            },
            dest: ['<%= env.DIR_DEST %>'],
            docs: ['<%= env.DIR_DOCS %>'],
            tmp: ['<%= env.DIR_TMP %>'],
            installed: [
                'tools/node-*',
                '<%= env.DIR_BOWER %>',
                '<%= env.DIR_NPM %>'
            ]
        },

        // Copies any files that should be moved to the destination directory
        // that are not already handled by another task.
        copy: {
            media: {
                files: [{
                    expand: true,
                    cwd: '<%= env.DIR_SRC %>',
                    src: ['assets/media/**'],
                    dest: '<%= env.DIR_DEST %>'
                }]
            },
            styles: {
                files: [{
                    expand: true,
                    cwd: '<%= env.DIR_SRC %>',
                    dest: '<%= env.DIR_DEST %>',
                    src: ['assets/{styles,vendor}/**/*.css']
                }]
            }
        },

        // Searches for bower comment blocks (`<!-- bower:* -->`) and injects
        // script and style tag references to bower modules into markup.
        bowerInstall: {
            all: {
                ignorePath: '<%= env.DIR_SRC %>/',
                src: ['<%= env.DIR_SRC %>/**/*.hbs']
            }
        },

        // Searches for build comment blocks (`<!-- build:* -->`) and generates
        // the appropriate `concat`, `cssmin`, and `uglify` grunt configuration.
        useminPrepare: {
            options: {
                root: '<%= env.DIR_SRC %>',
                staging: '<%= env.DIR_TMP %>',
                dest: '<%= env.DIR_DEST %>'
            },
            html: ['<%= env.DIR_SRC %>/**/*.hbs']
        },

        // Replaces script and style tag references with a reference to a single
        // optimized output file.
        usemin: {
            html: ['<%= env.DIR_DEST %>/**/*.html']
        },

        // YUIDoc plugin that will generate our JavaScript documentation.
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: '<%= env.DIR_SRC %>',
                    outdir: '<%= env.DIR_DOCS %>',
                    themedir: './node_modules/nerdery-yuidoc-theme'
                }
            }
        },

        // -- Lint Tasks -------------------------------------------------------

        // Verifies that style files conform to our standards.
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            all: {
                src: [
                    '<%= env.DIR_SRC %>/**/*.css',
                    '!**/node_modules/**',
                    '!**/vendor/**'
                ]
            }
        },

        // Verifies that script files conform to our standards.
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= env.DIR_SRC %>/**/*.js',
                    '!**/node_modules/**',
                    '!**/vendor/**'
                ]
            }
        },

        // -- Markup Tasks -----------------------------------------------------

        hbt: {
            options: {
                data: {
                    pkg: '<%= pkg %>',
                    env: '<%= env %>'
                },
                helpers: [
                    '<%= env.DIR_NPM %>/handlebars-layouts/handlebars-layouts.js'
                ],
                partials: [
                    '<%= env.DIR_SRC %>/templates/**/*.hbs'
                ]
            },
            all: {
                files: [{
                    expand: true,
                    cwd: '<%= env.DIR_SRC %>',
                    dest: '<%= env.DIR_TMP %>',
                    ext: '.html',
                    src: [
                        '**/*.hbs',
                        '!templates/**',
                        '!assets/vendor/**'
                    ]
                }]
            }
        },

        prettify: {
            options: {
                indent: 4,
                indent_inner_html: false, // jshint ignore:line
                unformatted: [
                    'a', 'b', 'code', 'i', 'p',
                    'pre', 'small', 'span',
                    'sub', 'sup', 'u'
                ]
            },
            all: {
                files: [{
                    expand: true,
                    cwd: '<%= env.DIR_TMP %>',
                    dest: '<%= env.DIR_DEST %>',
                    src: ['**/*.html']
                }]
            }
        },

        // -- Style Tasks ------------------------------------------------------

        compass: {
            dist: {
                options: {
                    config: 'config.rb'
                }
            }
        },


        cssmin: {
            options: {
                banner: '<%= banner %>'
            }
        },

        // -- Script Tasks -----------------------------------------------------

        browserify: {
            options: {
                debug: grunt.option('maps'),
                transform: [
                    'debowerify',
                    'decomponentify',
                    'deamdify',
                    'deglobalify'
                ]
            },
            all: {
                options: {
                    postBundleCB: function(err, src, next) {
                        next(err, grunt.config.process('<%= banner %>') + src);
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= env.DIR_SRC %>',
                    dest: '<%= env.DIR_DEST %>',
                    src: ['assets/scripts/main.js']
                }]
            }
        },

        // -- Task Helpers -----------------------------------------------------

        // Instead of running a server preprocessor, files and directories may
        // be watched for changes and have associated tasks run automatically
        // when you save your changes. This is compatible with the LiveReload
        // api, so you may use their free browser extensions to reload pages
        // after watch tasks complete. No purchase neccessary:
        // http://go.livereload.com/extensions
        watch: {
            options: {
                event: 'all',
                livereload: true
            },
            grunt: {
                files: ['Gruntfile.js'],
                tasks: ['build']
            },
            media: {
                files: ['<%= env.DIR_SRC %>/assets/media/**'],
                tasks: ['media']
            },
            markup: {
                files: ['<%= env.DIR_SRC %>/**/*.hbs'],
                tasks: ['markup']
            },
            styles: {
                files: ['<%= env.DIR_SRC %>/assets/{styles,vendor}/**/*.{css,scss}'],
                tasks: ['styles']
            },
            scripts: {
                files: ['<%= env.DIR_SRC %>/assets/{scripts,vendor}/**/*.js'],
                tasks: ['scripts']
            }
        },

        // It is assumed that all lint tasks may be run concurrently, meaning
        // markup, styles, and scripts may be safely linted at the same time.
        // Likewise for build tasks and documentation tasks. Order-dependent
        // tasks should be registered at the bottom of this file.
        concurrent: {
            lint: ['csslint', 'jshint'],
            build: ['media', 'markup', 'styles', 'scripts'],
            docs: ['yuidoc']
        }
    });

    // -- Tasks ----------------------------------------------------------------

    // Default task for development. Run with `grunt`.
    if (grunt.option('dev')) {
        grunt.registerTask('default', ['build']);
    }
    // Default task for staging. Run with `grunt --stage`.
    else if (grunt.option('stage')) {
        grunt.registerTask('default', ['lint', 'build']);
    }
    // Default task for production. Run with `grunt --prod`.
    else if (grunt.option('prod')) {
        grunt.registerTask('default', ['lint', 'docs', 'build']);
    }

    // Install task. Handles tasks that should happen right after npm and bower
    // modules are installed or updated. Run with `grunt install`.
    grunt.registerTask('install', ['bowerInstall']);

    // Concurrent tasks. Run with `grunt [task-name]`.
    grunt.registerTask('lint', ['force:on', 'concurrent:lint', 'force:reset']);
    grunt.registerTask('build', ['clean:dest', 'concurrent:build', 'clean:tmp']);
    grunt.registerTask('docs', ['clean:docs', 'concurrent:docs', 'clean:tmp']);

    // Custom tasks. Typically used by the `concurrent` and `watch` tasks, but
    // may be run manually with `grunt [task-name]`.
    grunt.registerTask('media', ['copy:media']);
    grunt.registerTask('markup', ['hbt', 'prettify']);
    if (grunt.option('dev')) {
        grunt.registerTask('styles', ['compass', 'copy:styles']);
    } else {
        grunt.registerTask('styles', ['useminPrepare', 'concat', 'cssmin', 'usemin']);
    }
    grunt.registerTask('scripts', ['browserify']);
};
