import { base64 } from "./base64";
import { global } from "./global";

class TenkaiServer {

	/**
	 * Constructs a new Tenkai server.
	 * 
	 * @param  {Number} listenPort The port to listen on.
	 */
	constructor(listenPort = 4989) {
		this.listenPort = listenPort;
		this.serverSocket = null;
		this.thread = null;
	}

	/**
	 * Shows an error message as a client message.
	 * 
	 * @param  {String} message The message.
	 */
	error(message) {
		clientMessage(ChatColor.RED + "Tenkai/Error> " + ChatColor.WHITE + message);
	}

	/**
	 * Shows a debug message.
	 * Currently a NOP.
	 * 
	 * @param  {String} message The message.
	 */
	debug(message) {
		// NOP
	}

	/**
	 * Shows a colorized informational message.
	 * 
	 * @param  {String} message The message.
	 */
	info(message) {
		clientMessage(ChatColor.GOLD + "Tenkai> " + ChatColor.WHITE + message);
	}

	/**
	 * Starts waiting for connections. If one is received,
	 * it accepts it and stops accepting new ones.
	 * Commands will be accepted and processed.
	 */
	wait_for_connections() {
		// The reason why most of the variables in this loop
		// still use "var" instead of "let" is because they need
		// to be accessible in some scopes that are created
		// inside of the for loops.
		// 
		// Using "let" instead may cause some bugs or cause the
		// entire code to explode.
		wait_for_socket:
		for (;;) {
			this.info("Waiting for incoming connections...");

			// Wait for incoming connections.
			var socket;
			try {
				socket = this.serverSocket.accept();
			} catch (_) {
				// Code can sometimes fail here
				// when we are stopping the server.
				break wait_for_socket; // Stop waiting.
			}

			this.debug("Received socket.");
			this.info("Client connected.");

			// Create some objects required to read and write data.
			var out_, in_;
			try {
				out_ = new java.io.PrintWriter(socket.getOutputStream(), true);
				in_ = new java.io.BufferedReader(
					new java.io.InputStreamReader(socket.getInputStream())
				);
			} catch (_) {
				// Code may throw something here
				// when we try to stop the server.
				// 
				// Somehow, it gets past the accept part
				// when we attempt to close the serverSocket.
				// 
				// I have no idea why, but this fixes it.
				break wait_for_socket; // Stop waiting.
			}

			// Continuously read lines from the client.
			read_from_client:
			for (;;) {
				// Read lines from the input and replace.
				var line = String(in_.readLine()).replace(/[\n\r\t]+/g, "");

				// Skip if it's empty.
				if (line === undefined || line === null ||
						line.length === 0 || line === "null") continue;

				var tokens = line.split(" ");

				this.debug("Received an " + tokens[0] + " command (" + line.length + " bytes)");
				if (line.length < 40) {
					this.debug("> " + line);
				}

				var force_client_disconnect = () => {
					// Close all streams and sockets, goodbye!
					out_.println("BRK"); // Tell the client we are leaving.
					out_.close();
					in_.close();
					socket.close();
					this.info("Client disconnected.");
				};

				// Can't use switch statement here because using
				// break; would break out of the for loop we are in.
				try {
					if (tokens[0] === "BRK") {
						// Client is leaving.
						force_client_disconnect();
						break read_from_client;
					} else if (tokens[0] === "FIL") {
						// Receiving a file from the client.
						// Fetch the file metadata.
						var fileContents = tokens[1];
						var fileName = tokens[2];

						if (!fileContents || !fileName) {
							this.error("Invalid FIL command.");

							// Decided that something is wrong with the client.
							// BAIL!
							force_client_disconnect();
						} else {
							this.info("Importing and decoding " + fileName + "...");

							// Write the file to the modscripts folder.
							var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
							var modScriptsFolder = ctx.getDir("modscripts", 0);
							var importedFile = new java.io.File(modScriptsFolder,
								fileName);
							var writer = new java.io.PrintWriter(importedFile);
							writer.write(base64.decode(fileContents));
							writer.flush();
							writer.close();

							// Make BL evaulate the file, even if it was already previously
							// imported.
							net.zhuoweizhang.mcpelauncher.ScriptManager.setEnabled(importedFile, false);
							net.zhuoweizhang.mcpelauncher.ScriptManager.setEnabled(importedFile, true);

							this.info("Done.");
						}
					} else if (tokens[0] === "IDN") {
						// Client has identified themselves.
						// Identify back (handshake, kind of)
						this.info("Client identified itself as " + (tokens[1] || "unknown"));
						out_.println("IDNH TenkaiServerModPE");
					}
				} catch (e) {
					// Exception occurred.
					// Disconnect from the client.
					this.error(e);
					force_client_disconnect();
					break read_from_client;
				}
			}
		}
	}

	stop_server() {
		if (this.serverSocket) {
			this.serverSocket.close();
			this.serverSocket = null;
			this.info("Server stopped.");
		}
	}

	_start_server() {
		if (this.serverSocket) {
			this.error("A server is already running.");
		} else {
			// Create a server.
			try {
				this.serverSocket = new java.net.ServerSocket(this.listenPort);
			} catch (e) {
				this.error("Failed to create server: " + e);
				return;
			}
			this.wait_for_connections();
		}
	}

	start_server() {
		clientMessage("Running server in new thread.");
		this.thread = new java.lang.Thread(new java.lang.Runnable({
			run: () => {
				this._start_server();
			}
		}));
		this.thread.start();
	}
}


// Our global server instance.
// Still using "var" here because other
// scopes need access to this variable.
var server = new TenkaiServer();

global.procCmd = (command) => {
	var tokens = command.split(" ");
	var first = tokens[0];

	if (first === "tenkai") {
		// Tenkai control command.
		// Controls our global server instance.

		switch (tokens[1]) {
		case "start":
			server.start_server();
			break;
		case "stop":
			server.stop_server();
			break;
		case "restart":
			server.stop_server();
			server.start_server();
			break;
		default:
			server.info("Usage: /tenkai [start|stop]");
			break;
		}
	}
};

