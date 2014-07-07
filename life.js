function getNodeIndex(node) { //via: http://stackoverflow.com/questions/11761881/javascript-dom-find-element-index-in-container
	var index = 0;
	while ((node = node.previousSibling)) {
		if (node.nodeType != 3 || !/^\s*$/.test(node.data))
			index++;
	}
	return index;
}

function docWidth() {
	return Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]);
}

function docHeight() {
	return Math.max(document.documentElement["clientHeight"], document.body["scrollHeight"], document.documentElement["scrollHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]);
}

document.onkeypress = keypress;

function keypress(e) {
	if (e.which == 32) {
		life.togglePlay();
	}
}

life = function(options){
	var defaults = {
			wait: 10,
			cols: 'auto',
			rows: 'auto',
			grow: 3,
			over: 4,
			lone: 1,
			element: 'life'
		},
		self = this;

	if (typeof options == "undefined") options = defaults;
	else {
		for (var i in defaults) {
			if (typeof options[i] == "undefined")
				options[i] = defaults[i];
		}
	}

	this.options = options;
	this.play = false;

	this.el = document.getElementById(options.element);
	if (!this.el) {
		document.writeln('<div id="' + options.element + '"></div>');
		this.el = document.getElementById(options.element);
	}

	this.el.className += ' life';
	this.el.innerHTML = '<b></b>';

	this.cols = options.cols;
	this.rows = options.rows;

	var dWidth = docWidth() - 10,
		dHeight = docHeight() - 10,
		width = this.el.childNodes[0].offsetWidth,
		height = this.el.childNodes[0].offsetHeight;

	console.log([dWidth, dHeight, width, height]);

	if (options.cols == 'auto') {
		this.cols = Math.floor(dWidth/width);
	}
	if (options.rows == 'auto') {
		this.rows = Math.floor(dHeight/height);
	}

	this.el.onclick = function(e) {
		if (e.target.tagName == 'DIV')
			return;

		var col = getNodeIndex(e.target),
			row = getNodeIndex(e.target.parentNode);
		console.log([col, row]);

		self.toggle(col, row).refreshGrid();
	}

	this.toggle = function(col, row) {
		this.grid[col][row] = !this.grid[col][row];
		return this;
	}

	this.set = function(col, row, bool) {
		this.grid[col][row] = bool;
		return this;
	}

	this.initializeGrid = function(cols, rows) {
		if (typeof cols == "undefined") {
			cols = this.cols;
			rows = this.rows;
		}

		this.grid = new Array(cols);
		var hc = Math.floor(cols/2),
			hr = Math.floor(rows/2),
			start = [[hc, hr], [hc, hr+1], [hc+1,hr], [hc-1, hr], [hc+2, hr-1]];

		for (var i = 0; i < cols; i++) {
			this.grid[i] = new Array(j);
			for (var j = 0; j < rows; j++) {
				var alive = false;
				for (var k = 0; k < start.length; k++) {
					if (start[k][0] == i && start[k][1] == j) {
						alive = true;
						break;
					}
				}
				this.set(i, j, alive);
			}
		}

		return this;
	};

	this.refreshGrid = function() {
		var html = '';
		for (var j = 0; j < this.rows; j++) {
			html += '<div>';
			for (var i = 0; i < this.cols; i++) {
				html += this.grid[i][j] ? '<a></a>' : '<b></b>';
			}
			html += '</div>';
		}
		this.el.innerHTML = html;

		return this;
	};

	this.copyGrid = function() {
		var newGrid = [];
		for (var i = 0; i < this.cols; i++) {
			newGrid[i] = new Array(j);
			for (var j = 0; j < this.rows; j++) {
				newGrid[i][j] = this.grid[i][j];
			}
		}

		return newGrid;
	}

	this.run = function() {
		if (!this.play) return this;
		var lastGrid = this.copyGrid();
		for (var i = 0; i < this.cols; i++) {
			for (var j = 0; j < this.rows; j++) {
				var alive = lastGrid[i][j],
					sum = alive ? -1 : 0; //if this grid item were alive, it would add one to the sum in the next step
				for (var k = Math.max(0, i - 1); k < Math.min(this.cols, i + 2); k++) {
					for (var l = Math.max(0, j - 1); l < Math.min(this.rows, j + 2); l++) {
						if (lastGrid[k][l]) sum++;
					}
				}

				if ((alive && (sum >= options.over || sum <= options.lone)) || (!alive && sum == options.grow))
					this.grid[i][j] = !alive;
			}
		}
		this.refreshGrid();
		setTimeout(function(){
			self.run();
		}, options.wait);

		return this;
	};

	this.togglePlay = function() {
		this.play = !this.play;
		this.run();
	}

	this.initializeGrid();
	this.refreshGrid();
	this.run();
};