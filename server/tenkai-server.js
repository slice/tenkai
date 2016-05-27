var server;
var server_port = 4989;
var thread;

/*! https://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}
}(this));

function error(message) {
	clientMessage(ChatColor.RED + "Tenkai/Error> " + ChatColor.WHITE + message);
}

function debug(message) {
	// Don't do anything, so we don't clog up the chat.
	// clientMessage("[Tenkai/Debug] " + message);
}

function info(message) {
	clientMessage(ChatColor.GOLD + "Tenkai> " + ChatColor.WHITE + message);
}

function wait_for_connections() {
	for (;;) {
		debug("Waiting for incoming connections...");
		// Wait for incoming connections.
		var socket = server.accept();

		debug("Received socket.");
		info("Client connected.");

		// Create some objects required to read and write data.
		var out_ = new java.io.PrintWriter(socket.getOutputStream(), true);
		var in_ = new java.io.BufferedReader(
			new java.io.InputStreamReader(socket.getInputStream())
		);

		// Continuously read lines from the client.
		for (;;) {
			// Read lines from the input and replace.
			var line = String(in_.readLine()).replace(/[\n\r\t]+/g, "");

			// Skip if it's empty.
			if (line === undefined || line === null ||
					line.length === 0 || line === "null") continue;

			var tokens = line.split(" ");

			debug("Received an " + tokens[0] + " command (" + line.length + " bytes)");
			if (line.length < 40) {
				debug("> " + line);
			}

			var force_client_disconnect = function() {
				// Close all streams and sockets, goodbye!
				out_.println("BRK"); // Tell the client we are leaving.
				out_.close();
				in_.close();
				socket.close();
				info("Client disconnected.");
			};

			// Can't use switch statement here because using
			// break; would break out of the for loop we are in.
			try {
				if (tokens[0] === "BRK") {
					// Client is leaving.
					force_client_disconnect();
					break;
				} else if (tokens[0] === "FIL") {
					// Receiving a file from the client.
					// Fetch the file metadata.
					var fileContents = tokens[1];
					var fileName = tokens[2];

					if (!fileContents || !fileName) {
						error("Invalid FIL command.");
					} else {
						info("Importing and decoding " + fileName + "...");

						// Write the file to the modscripts folder.
						var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
						var modScriptsFolder = ctx.getDir("modscripts", 0);
						var importedFile = new java.io.File(modScriptsFolder,
							fileName);
						var writer = new java.io.PrintWriter(importedFile);
						writer.write(base64.decode(fileContents));
						writer.flush();
						writer.close();

						// Make BL evaulate the file.
						net.zhuoweizhang.mcpelauncher.ScriptManager.setEnabled(importedFile, false);
						net.zhuoweizhang.mcpelauncher.ScriptManager.setEnabled(importedFile, true);

						info("Done.");
					}
				} else if (tokens[0] === "IDN") {
					// Client has identified themselves.
					// Identify back (handshake, kind of)
					info("Client identified itself as " + (tokens[1] || "unknown"));
					out_.println("IDNH TenkaiServerModPE");
				}
			} catch (e) {
				// Exception occurred.
				// Disconnect from the client.
				error(e);
				force_client_disconnect();
			}
		}
	}
}

function stop_server() {
	debug("Server stopped.");
	if (server) server.close();
}

function _start_server() {
	if (server) {
		error("A server is already running.");
	} else {
		// Create a server.
		try {
			server = new java.net.ServerSocket(server_port);
		} catch (e) {
			error("Failed to create server: " + e);
			return;
		}
		wait_for_connections();
	}
}

function start_server() {
	clientMessage("Running server in new thread.");
	thread = new java.lang.Thread(new java.lang.Runnable({
		run: function() {
			_start_server();
		}
	}));
	thread.start();
}

function procCmd(command) {
	var tokens = command.split(" ");
	var first = tokens[0];

	if (first === "tenkai") {
		switch (tokens[1]) {
		case "start":
			start_server();
			break;
		case "stop":
			stop_server();
			break;
		default:
			info("Usage: /tenkai [start|stop]");
			break;
		}
	}
}

