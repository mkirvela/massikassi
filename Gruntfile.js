module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            all: [
                "public/dist/"
            ]
        },

        jshint: {
            all: [
                "Gruntfile.js",
                "server/**/*.js",
                "db/**/*.js",
            ]
        },

        less: {
            development: {
                files: {
                    "public/dist/stylesheets/screen.css": "public/less/screen.less"
                }
            }
        },

        cssmin: {
            options: {
                report: "min"
            },
            minify: {
                expand: true,
                cwd: "public/dist/stylesheets",
                src: ["*.css", "!*.min.css"],
                dest: "public/dist/stylesheets",
                ext: ".min.css"
            }
        },

        "template-module": {
            compile: {
                options: {
                    module: true,
                    provider: "underscore"
                },
                files: {
                    "public/js/templates/templates.js": ["public/views/*.html"]
                }
            }    
        },
    
        react: {
            jsx: {
                files: [
                    {
                        expand: true,
                        cwd: "public/js",
                        src: [ "**/*.jsx" ],
                        dest: "public/dist/js",
                        ext: ".js"
                    }
                ]
            }
        },

        watch: {
            script: {
                files: ["public/js/**/*.jsx", "public/less/**/*.less"],
                tasks: ["init"],
                options: {
                    interrupt: true
                }
            }
        },
    
        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 5, // maximum number of notifications from jshint output
                title: "massikassi" // defaults to the name in package.json, or will use project directory"s name
            }
        },
    
        copy: {
            main: {
                files: [
                    // includes files within path
                    { 
                        expand: true, 
                        cwd: "public/img/",
                        src: "**",
                        dest: "public/dist/img/", 
                        flatten: true,
                        filter: "isFile" 
                    }
                ]
            },
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: "public/fonts/",
                        src: "**",
                        dest: "public/dist/fonts/",
                        flatten: true,
                        filter: "isFile"
                    }   
                ]
            }
        },
    
        browserify: {
            options: {
                transform: [ require("grunt-react").browserify ]
            },
            client: {
                src: ["public/js/**/*.jsx"],
                dest: "public/dist/js/app.built.js"
            }
        },
    
        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            production: {
                files: {
                    "public/dist/js/app.built.js": [
                            "public/dist/js/app.built.js"
                        ]
                }
            }
        },
        
        styleguide: {
            options: {
                framework: {
                    name: "kss",
                    options: {
                        includePath: "public/dist/stylesheets/screen.css"
                    }
                }
            },
            all: {
                files: {
                    "public/dist/styleguide": ["public/less/main.less"]
                }
              }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks("grunt-template-module");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-react");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-notify");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-styleguide");
    grunt.registerTask("init", ["clean", "copy", "jshint", "react", "browserify", "less", "cssmin"]);
    grunt.registerTask("heroku", ["clean", "copy", "jshint", "react", "browserify", "uglify:production", "less", "cssmin"]);
};
