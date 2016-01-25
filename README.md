
TINK
=====

This is a media browser / player. Just point it at a web
resource with a Kodi / XBMC compatible directory layout and
you're all set.

Tink supports both standard HTTP webservers that send a
human-readable directory index and WEBDAV servers.

RUNNING
=======

Your media files should be present on the local system, or on
a webserver. Put the app there as well. Do: "npm run dist",
this builds a zipfile, then unzip the zipfile in a suitable place.

Copy the appconfig.json.sample file to appconfig.json, and
edit the configuration.

CONTENT SERVER CONFIGURATION
============================

Your media files should layed out and named as documented here:

http://kodi.wiki/view/Naming\_video\_files/TV\_shows
http://kodi.wiki/view/Naming\_video\_files/Movies

With added restrictions:

- you must put each movie in its own directory.
- multi-file movies are not supported yet
- for tvshows, the episodes have to be located in a folder
  per season, so whatever.s01e03.mp4 goes in the "S01/"
  directory (this will be fixed in the future).

Note that if you are pointing the configuration to a location
*different* from where you are serving Tink from, the webserver
has to set the following headers because of CORS (examples are
in the Apache webserver coniguration file format):

Normal HTTP server:

	Header set Access-Control-Allow-Origin "*"

Webdav server:

	Header set Access-Control-Allow-Origin "*"
	Header set Access-Control-Allow-Methods "GET, OPTIONS, PROPFIND"
	Header set Access-Control-Allow-Headers "Depth"

BUILDING
========

You need to have nodejs installed. Then:

	npm update
	gulp
	npm run dist

There should be a zip file in dist/ with the whole app.

DEVELOPING
==========

- To bundle up and build the javascript and css once, run:

	gulp

- For continuous automatic updates / builds, run:

	gulp watch

- The entry point for a webbrowser is app/ (app/index.html).

