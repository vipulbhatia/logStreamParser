var fs = require('fs'),
	emitter = require('events').EventEmitter,
	util = require('util');

var logStreamParser = function(filePath) {
	var that = this;
	emitter.call(this);//inherit from EventEmitter
	var currSize = -1,
		watcher,
		buffer = "",
		readStream,
		patt = new RegExp("([a-zA-Z]+\\s\\d{2},\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\s[A-Z]+T):[\\s|\\t]({.*})\\r\\n");

	var getFileSize = function() {//cb is callback function that will be invoked once we get file size
		fs.stat(filePath, function(err, info) {
			if(err) console.log('error: getting file size: ' + err);
			else {
				if(currSize !== -1) {
					if((currSize - info.size) != 0) {
						that.emit('sizeChange', currSize, info.size);
						currSize = info.size;
					}
				} else {
					currSize = info.size;
					that.emit('ready', currSize);
				}
			}
		});
	}
	
	var getData = function(opts) {
		console.log('reading log...');
		opts.flags = 'r';
		var readStream = fs.createReadStream(filePath, opts);

		readStream.on('data', function(chunk) {
			chunk = chunk.toString();
			if(buffer !== "") 	{
				chunk = buffer.concat(chunk);
				buffer = "";
			}
			console.log('chunk:',chunk);
			while(match = patt.exec(chunk)) {
				//console.log(match);
				console.log('timestamp: ' + match[1] + '    data: ' + match[2]);
				chunk = chunk.replace(patt, '');
			}
			buffer += chunk;
			console.log('buffer:' + buffer);
			//buffer = buffer.replace(/^\s*[\r\n]$/gm, ''); //enabling this overwrites last line of buffer if concatenation is done which is not intended
		});

		readStream.on('end', function() {
			console.log('readStream ended...');
		});
	};

	this.on('ready', function(size) {
		console.log(size);
		getData({}); 
	});

	this.on('sizeChange', function(currSize, newSize) {
		console.log('sizeChange called: ' + currSize + ':' + newSize);
		getData({start:currSize,end:newSize});
	});

	this.watch = function() {
		watcher = setInterval(getFileSize, 100);
	};

	this.stop = function() {
		clearInterval(watcher);
	};
}

util.inherits(logStreamParser, emitter);

var x = new logStreamParser('abc.log');

x.watch();
setTimeout(x.stop, 1000000);