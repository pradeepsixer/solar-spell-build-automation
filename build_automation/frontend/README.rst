**************************************
React Development Environment
**************************************

1. Installing the requirements
##############################

This particular setup uses webpack to bundle the necessary files.

Front-end (React)::

   cd frontend
   npm install
   add the node_modules/.bin/ to PATH Environment Variable - Required.

2. Building
###########

Running the build scripts will bundle the necessary resources, and move the generated output to `build_automation/content_management/static` directory (The existing content will be wiped).

There are two options available for building - Production and Development versions.

**Production version** - JS is minified. Hard to track the origin of the problem. React does not display errors helpful in debugging.

**Development version** - JS is not minified. Makes it easier to track the origin of the problem. React displays error messages which are helpful in debugging the problem, and also some useful validation errors.

.. important:: All the build commands must be run from `build_automation/frontend` directory

Linux / Mac
===========

* `npm run build` - Builds the production version.
* `npm run build-dev` - Builds the development version.

Windows
=======


* `npm run winbuild` - Builds the production version.
* `npm run winbuild-dev` - Builds the development version.
