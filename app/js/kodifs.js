/*
 * kodifs.js	Handle movies and TV shows located on a
 *				filesystem using the Kodi/XBMC naming conventions.
 *
 *				http://kodi.wiki/view/Naming_video_files/Movies
 *				http://kodi.wiki/view/Naming_video_files/TV_shows
 *
 * Call as:
 *
 * var KodiFS = require('kodifs.js')
 *
 * var kodifs = new KodiFS({ url: 'http://.....' });
 * var tvshows = kodifs.getshows();
 *
 * var kodifs = new KodiFS({ url: 'http://.....' });
 * var movies = kodifs.getmovies();
 *
 * TODO:		Split up into KodiFS.TVShows and KodiFS.Movies ?
 *
 */

import  $		from 'jquery';
import  _		from 'underscore';
import  Http	from './http.js';
import  Webdav	from './webdav.js';
import PQueue	from './pqueue.js';

// helper: decode season / episode from filename.
function decodeShowName(e) {

	var r = {};

	var s = /^(.*)\.([^.]+)$/.exec(e.name);
	if (s == null)
		return;
	var name = s[1];
	var ext = s[2];

	// pattern: ___.s03e04.___
	var s = /^.*[ .][sS]([0-9]+)[eE]([0-9]+)[ .].*$/.exec(e.name);
	if (s) {
		name = "Episode " + s[1] + 'x' + s[2];
	}

	// pattern: ___.s03e04e05.___ or ___.s03e04-e05.___
	if (s == null) {
		s = /^.*[. [sS]([0-9]+)[eE]([0-9]+)-?[eE]([0-9]+)[. ].*$/.exec(e.name);
		if (s) {
			name = 'Episode ' + s[1] + 'x' + s[2] + '-' + s[3];
		}
	}

	// pattern: ___.2015.03.08.___
	if (s == null) {
		s = /^.*[ .]([0-9]{4}[.-][0-9]{2}[.-][0-9]{2})[ .].*$/.exec(e.name);
		if (s) {
			name = "Episode " + s[1];
		}
	}

	// pattern: ___.308.___  (or 3x08) where first number is season.
	if (s == null) {
		s = /^.*[ .]([0-9]{1,2})x?([0-9]{2})[ .].*$/.exec(e.name);
		if (s && (shint == null || s[1] == shint)) {
			var se = s[1] + 'x' + s[2];
			if (s[1].length < 2)
				se = '0' + key;
			name = "Episode " + se;
		}
	}
	return {
		name: name,
		ext: ext,
	};
}

// helper: turn list of directories into list of shows.
function builddirlist(base, list, data) {
		if (data.time)
			base.time = data.time;
		for (var i in data.items) {
			var s = data.items[i];
			if (s.name.match(/^[.+]/))
				continue;
			list[s.name] = s;
		}
		return list;
}

var isMovie = /^(.*)\.(divx|mov|mp4|MP4|m4u|m4v)$/;
var isImage = /^-(banner|fanart|folder|poster|)\.(png|jpg|jpeg|tbn)/;
var isInfo = /^(\..*)?\.(nfo|tbn|srt)/;

// helper: turn list of files into basic movie information.
function buildmovie(movie, data) {

	//console.log('buildmovie', movie);

	if (data.time)
		movie.time = data.time;

	var base = '';
	for (var i in data.items) {
		var s = isMovie.exec(data.items[i].name);
		if (s) {
			movie.video = s[0];
			base = s[1];
			break;
		}
	}
	if (base == '')
		return movie;
	var len = base.length;

	for (var i in data.items) {
		var item = data.items[i];
		var n = item.name.slice(0, len);
		if (n != base)
			continue;

		n = item.name.slice(len);
		var s = isImage.exec(n);
		if (s) {
			movie[s[1]] = item.path;
			continue;
		}

		s = isInfo.exec(n);
		if (s) {
			switch(s[2]) {
				case 'tbn':
					movie.poster = item.path;
					break;
				case 'nfo':
					movie.nfo = item.path;
					break;
				case 'srt':
					if (movie.subs == null)
						movie.subs = [];
					movie.subs.push({
						lang: s[1] ? s[1].replace(/^\./, '') : '',
						path: item.path,
					});
					break;
			}
		}
	}

	//console.log(movie);
  return movie;
}

// helper: turn list of files into basic show information.
function buildshow(show, data) {

	if (data.time)
		show.time = data.time;

	// first build list of seasons.
	show.seasons = {};
	for (var i in data.items) {
		var e = data.items[i];
		if (e.name.match(/^S[0-9]+/)) {
			show.seasons[e.name] = {
				name: e.name,
				sortName: e.name,
				path: e.path,
			};
		}
	}

	// now loop over files in this directory.
	for (var i in data.items) {

		var e = data.items[i];

		// NFO file
		if (e.name == 'tvshow.nfo') {
			show.nfo = e.path;
			continue;
		}

		// images.
		var s;
		var lowqual = false;
		var imgtype = null;
		var ctx = null;

		// Season image?
		s = /^(lowqual-|)season([0-9]+)-?([a-z]+|)\.(jpg|jpeg|png|tbn)/.exec(e.name);
		if (s) {
			var ctx = show.seasons['S' + s[2]];
			if (!ctx)
				continue;
			lowqual = s[1] == 'lowqual' ? true : false;
			imgtype = s[3] != '' ? s[3] : 'thumb';
			if (imgtype && (lowqual || !ctx[imgtype]))
				ctx[imgtype] = '../' + e.path;
			continue;
		}

		// General tvshow image?
		s = /^(lowqual-|)(.*)\.(jpg|jpeg|png|tbn)$/.exec(e.name);
		if (s) {
			ctx = show;
			switch(s[2]) {
				case 'banner':
				case 'fanart':
				case 'folder':
				case 'poster':
					imgtype = s[2];
					break;
				case 'season-all-banner':
					imgtype = 'banner';
					break;
				case 'season-all-poster':
					imgtype = 'poster';
					break;
			}
			lowqual = s[1] == 'lowqual' ? true : false;
			if (imgtype && (lowqual || !ctx[imgtype]))
				ctx[imgtype] = e.path;
		}
	}

  return show;
}

// helper: turn list of files into a season of episodes.
function buildseason(season, data) {

	var ep = {};
	season.episodes = ep;
	if (data.time)
		season.time = data.time;

	var shint;
	var s = /^S0*(\d+)$/.exec;
	if (s)
		shint = s[1];

	for (var i in data.items) {

		var e = data.items[i];

		var r = decodeShowName(e, shint);
		if (!r)
			continue;
		var name = r.name;
		var ext = r.ext;

		if (!ep[name])
			ep[name] = {};
		ep.path = '';

		switch(ext) {
			case 'mkv':
			case 'mp4':
			case 'avi':
				ep[name].video = e.path;
				if (e.time)
					ep[name].time = e.time;
				ep[name].name = name;
				ep[name].sortName = name;
				break;
			case 'nfo':
				ep[name].nfo = e.path;
				break;
			case 'tbn':
				ep[name].thumb = e.path;
				break;
			case 'jpg':
			case 'png':
				if (e.name.match(/-thumb.([^.]+)$/))
					ep[name].thumb = e.path;
				break;
			case 'srt':
				if (ep[name].subs == null)
					ep[name].subs = [];
				var s = /^.*\.(.*)\.srt$/.exec(e.name);
				ep[name].subs.push({
					path: e.path,
					lang: s ? s[1] : '',
				});
				break;
			default:
				break;
		}
	}

	// delete entries without a video file.
	for (var e in ep) {
		if (!ep[e].video)
			delete ep[e];
	}

	return season;
}

export default class KodiFS {

	url;
	name = "";
	path = '';
	items;
	pqueue;

	constructor(opts) {
		console.log('constructor called opts is ', opts);
		_.extend(this, _.pick(opts, [ 'url', 'proto' ]));
		if (this.url.match(/^(web|)davs?:/)) {
			this.proto = 'webdav';
			this.url = this.url.replace(/^(web|)dav/, "http");
		}
		this.dirIndex = (this.proto == 'webdav') ? Webdav : Http;
		this.pqueue = new PQueue();
	};

	// Get a directory listing of tvshows / movies.
	dirlist(type) {

		if (this.items != null) {
			console.log("kodifs.dirlist: returning cached " + type);
			return Promise.resolve(this.items);
		}

		console.log("kodifs.dirlist: requesting " + type + " from server");
		var wd = new this.dirIndex();
		var dfd = wd.listdir(this.url)
		  .then((data) => {
			//console.log("got it calling builddirlist", this.url, data);
			this.items = {};
			return builddirlist(this, this.items, data);
		});

		return dfd;
	};

	getshows(args) {
		return this.dirlist('shows')
		.then(function(shows) {
			if (args && args.show)
				shows.show = shows[args.show];
			return shows;
		});
	};

	getmovies(args) {
		return this.dirlist('movies')
		.then(function(movies) {
			if (args && args.movie)
				movies.movie = movies[args.movie];
			return movies;
		});
	};

	// Get gets the basic info for one tvshow.
	getOneShow(showname) {

		var r = this.getshows().then(function(shows) {

			var show = shows[showname];
			if (!show) {
				console.log("kodifs.getOneShow: showname " +
								showname  + " not found");
				return Promise.reject(new Error('show not found'));
			}
			if (show.seasons) {
				console.log("kodifs.getOneShow: returning cached " + showname);
				return Promise.resolve(show);
			}


			console.log("kodifs.getOneShow: requesting " +
								showname + " from server");
			var url = this.url + '/' + show.path;
			var wd = new this.dirIndex();
			var dfd = wd.listdir(url)
			  .then(function(data) {
				return buildshow(show, data);
			});
			return dfd;
		}.bind(this));

		return r;
	};

	// Gets all the episodes in one season.
	getSeasonEpisodes (showname, seasonname) {

		var r = this.getOneShow(showname).then(function(show) {

			var season = show.seasons[seasonname];
			if (!season) {
				console.log("kodifs.getSeasonEpisodes: season " +
								seasonname  + " not found");
				return Promise.reject(new Error('season not found'));
			}

			// already have it?
			if (season.episodes) {
				console.log("kodifs.getSeasonEpisodes: returning cached " +
												seasonname);
				return Promise.resolve(show);
			}

			console.log("kodifs.getSeasonEpisodes: requesting " +
							seasonname + " from server");

			var url = this.url + show.path + season.path;
			var w = new this.dirIndex();
			var dfd = w.listdir(url)
			  .then(function(data) {
				buildseason(season, data);
				return show;
			});
			return dfd;

		}.bind(this));

		return r;
	};

	// Get the info for one show.
	_getshow(args) {

		return this.getOneShow(args.show)
		.then((show) => {

			// make sure at least one deferred is present.
			var defers = [ Promise.resolve() ];

			// get season info as well ?
			if (Object.keys(show.seasons).length > 0 &&
				(args.deep || args.episode)) {

				for (var sn in show.seasons) {
					var sname = show.seasons[sn].name;
					if (!args.season || args.season == sname)
						defers.push(this.getSeasonEpisodes(args.show, sname));
				}
			}

			// wait for all of them to resolve or fail.
			return Promise.all(defers)
			.then(() => {
				// set 'show' shortcut
				this.items.show = show;
				// set 'season' shortcut.
				if (args.season) {
					var s = show.seasons[args.season];
					// if changed, reset episode.
					if (!show.season || !s || (show.season.name != s.name))
						show.episode = null;
					show.season = s;
				}
				// set 'episode' shortcut.
				if (args.episode && show.season) {
					show.episode = show.season.episodes[args.episode];
				}
				return show;
			});
		});
	};

	// Get gets the info for one movie.
	_getmovie(moviename) {

		var r = this.getmovies().then((movies) => {

			var movie = movies[moviename];
			if (!movie) {
				console.log("kodifs.getmovie: moviename " +
								moviename  + " not found");
				return Promise.reject(new Error('movie not found'));
			}
			if (movie.video) {
				console.log("kodifs.getmovie: returning cached " + moviename);
				return Promise.resolve(movie);
			}

			console.log("kodifs.getmovie: requesting " +
								moviename + " from server");
			var url = this.url + '/' + movie.path;
			var wd = new this.dirIndex();
			var dfd = wd.listdir(url)
			  .then((data) => {
				var m = buildmovie(movie, data);
				this.items.movie = m;
				return m;
			});
			return dfd;
		});

		return r;
	};

	getshow(args) {
		return this.pqueue.push(this._getshow.bind(this, args));
	};

	getmovie(args) {
		return this.pqueue.push(this._getmovie.bind(this, args));
	};

};

