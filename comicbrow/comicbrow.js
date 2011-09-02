#!/usr/bin/env node
var port = 1337;
// req: apt-get install avfs && mountavfs
var avfsRoot = process.env.HOME+"/.avfs/"+process.env.HOME+"/Kuvat/Sarjikset";

// This is the simple html served to browser
// To decode echo .. | base64 -d | zcat >cb.html
// To encode gzip -c cb.html | base64 -w0
var htmlBuf = new Buffer(
	'H4sICPu0YE4AA2NvYm8zLmh0bWwAjZE9T8MwEIZn8iuM9/hUkBAtTpAozDCwMLrONXFw7NR2muTfYydFQrAw2ffe3XNf/Pr5df/+8fZCmtDpMuPpIVOnjS9oE0K/AxjHkY23zLoaNtvtFqYUQ1PQTgtTFxQNJd+/fPA0YVBUZXbFOwyCJE6Op0GdCyqtCWhCHuYeKblYBQ04BUjcByIb4TyGYgjH/J4SSJiggsZybzsln5wdOaxC9HjpVB9Iwl0orTiLVaXEO7mO4eMcohUTq62tNYpeeSZtt2ig1cFDexrQzbBhd+zmYrBOGdbGeTiswH8WBJkaPcRG2aD+ALQynz/TpfeUONQF9WHW6BvECGocHn+Tlsi4Dw7revnBVnOZZdz3whBVxVFR97R8jOWikjyVOi+OtGihDLp0HIhqcsKaz2G9ffYFhtUrjw0CAAA=',
	'base64'
);

// req: npm install mime imagemagick
var fs = require("fs");
  http = require("http"),
  imag = require("imagemagick"),
  mime = require("mime"),
  path = require("path"),
  url = require("url"),
  util = require("util"),
  sys = require("sys"),
  mime = require('mime');

try {
	fs.statSync(avfsRoot);
} catch(e) {
	log("Please configure avfsRoot and run mountavfs");
	process.exit(1);
}

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
Array.prototype.each = function(fun) {
	if (typeof fun != "function") return;
	for (var i=0; i<this.length; i++) {
		fun(i, this[i]);
	}
	return this;
};
function sprintf(format, etc) {
	var i = 1, arg = arguments;
	return format.replace(/%((%)|s)/g, function (m) { return m[2] || arg[i++] });
}

function ansi(code, txt) {
	return "\033[0;"+code+txt+"\033[0m";
}
function log(txt) {
	sys.log(ansi("34m", txt));
}

function isArchive(path) {
	return /(cbz|cbr|zip|rar|tar)$/.test(path);
}

var HttpException = function (req, res, msg, code) {
  this.req = req;
  this.res = res;  
  this.msg = msg;    
  this.code = code || 500;
};
process.on('uncaughtException', function(ex) {
	try {
		log([ex.req.connection.remoteAddress, ex.req.method, ex.req.url, ex.code].join(' '));
  	ex.res.writeHead(ex.code, {'Content-Type':'text/html'});
		var out = sprintf("Error %s: %s", ex.code, ex.msg);
	  ex.res.end(out);
		sys.log(ansi("35m", "Exception: "+ex.msg));
	} catch(e){
		sys.log(ansi("35m", "Unknown exception "+ex+util.inspect(ex)+"\n"+ex.stack));
	}
});

function handleAjax(req, res) {
	var avfsPath = unescape(avfsRoot+'/'+url.parse(req.url).pathname);

	path.exists(avfsPath, function(exists) {
		if(!exists) throw new HttpException(req, res, "Huh?", 404);

		var ls = {dirs:{'..':''},files:{}};
		fs.readdirSync(avfsPath).sort().every(function(n,i) {
			var f = fs.statSync(avfsPath+'/'+n);
			if(f.isDirectory() || isArchive(n)) {
				// some avfs magic
				if(n.endsWith('cbr'))
					n += '#urar';
				else if(n.endsWith('cbz'))
					n += '#uzip';
				ls.dirs[escape(n)] = f;
			} else {
				ls.files[escape(n)] = f;
			}
			return true;
		});
		res.writeHead(200, {'Content-Type':'text/json'});
		res.end(JSON.stringify(ls));
	});
}

function handleStatic(req, res) {
	var reqPath = url.parse(req.url).pathname.substring(1);
	if(reqPath == 'favicon.ico') {
		res.writeHead(200, {"Content-Type": "image/gif"});
		res.end(new Buffer("R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==","base64"), "binary");
		return;
	} else if(/^[^\/]*\.(css|js)$/.test(reqPath)) {
		if(!path.existsSync(reqPath)) throw new HttpException(req, res, "Huh?", 404);
		var type = mime.lookup(reqPath);
		res.writeHead(200, {'Content-Type':type});
		fs.readFile(reqPath, function (err, file) { res.end(file); });
		return;
	}

	// rest deals with avfs
	
	var avfsPath = unescape(avfsRoot+'/'+reqPath);
	// existsSync missing from docs, futureproof?
	if(!path.existsSync(avfsPath)) {
		throw new HttpException(req, res, "Huh?", 404);
	}
	
	var f = fs.statSync(avfsPath);
	if(f.isDirectory()) {
		res.writeHead(200, {'Content-Type':'text/html', 'Content-Encoding':'gzip'});
		res.end(htmlBuf, "binary");
		//util.pump(fs.createReadStream('cobo.html'), res, function(e) {	});
		//fs.readFile("cobo.html", function (err, file) { res.end(file); });
		return;
	}
	
	var q = url.parse(req.url, true).query;
	var type = mime.lookup(avfsPath);
	if(typeof req.headers['if-modified-since'] != 'undefined') {
		var mod = Date.parse(req.headers['if-modified-since']);
		if(f.mtime <= mod)
			throw new HttpException(req, res, "Not Modified", 304);
	}
	// todo: on localhost it'd be faster to serve unscaled
	if(/^[0-9\.]*x[0-9\.]*$/.test(q['max']) && parseInt(q['r']) >= 0) {
		var opts = [avfsPath,'-resize',q['max']+'>','-rotate',q['r'],'-'];
		imag.convert(opts, function(err, stdout, stderr){
			log(stderr);
			if(err) throw new HttpException(req, res, err);
			res.writeHead(200, {"Content-Type":type, "Last-Modified":f.mtime});
			res.write(stdout, "binary");
			res.end();
		});
	} else {
		sys.log(ansi("33m", "Something wrong with max/r query params: "+util.inspect(q)));
		fs.readFile(avfsPath, "binary", function (err, file) {
			if(err) throw new HttpException(req, res, err);
			res.writeHead(200, {"Content-Type":type, "Last-Modified":f.mtime});
			res.write(file, "binary");
			res.end();
		});
	}
}

http.createServer(function(req, res) {
	(req.headers['x-requested-with'] == 'XMLHttpRequest' ? handleAjax : handleStatic)(req, res);
	log([req.connection.remoteAddress, req.method, req.url, res.statusCode].join(' '));
}).listen(port);
log("Listening on port "+port)

