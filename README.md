
TINK
=====

This is a media browser / player. Just point it at a webdav
resource with a Kodi / XBMC compatible directory layout and
you're all set.

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
- 
