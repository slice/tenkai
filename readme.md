# `tenkai` (展開)

Develop ModPE scripts on your PC, deploy them on your phone instantly over the air.

## How this works

`tenkai.min.js`/`tenkai.js` runs on your phone, in BlockLauncher. It is a TCP server that runs in the background, on a separate thread.
It receives commands from your computer, using a client or client library.

- `tenkai-client.py`
	- Tenkai client written in Python.
	- Usage: `tenkai-client.py [phone ip] [js file to send]`
- `tenkai-client.js`
    - Tenkai client library written in Node.
    - Intended to be used by other scripts, using `require`.
- `tenkai-client-node`
    - Tenkai client written in Node, uses `tenkai-client.js` to connect to servers.
    - Usage: `tenkai-client-node [phone ip] [js file to send]` 

When the server (your phone) receives a new file, it decodes it and imports the `.js` file on the fly.
This makes development with a PC much easier.

## Security

**NOTE: PLEASE READ!** This software not secure. Anybody scanning the network can evaluate JavaScript on your phone without you even knowing unless you are constantly watching your phone. This also means they can modify your SD Card (`/sdcard/`). Please be aware of this; this is your only disclaimer.

If you're on your own private, secured network, then you shouldn't worry about anything.

## Building

Make sure that the repository is cloned.

```sh
$ cd $REPO # Navigate into the repo.
$ cd server/ # Navigate into the server directory.
$ npm install -g grunt-cli # If Grunt isn't already installed.
$ npm install # Install dependencies.
$ grunt # Compile.

# Server located at dist/tenkai.min.js. Use this if you don't plan on hacking Tenkai.
# Use dist/tenkai.js while developing the server to see where errors occur.
# 
# You can transfer the `tenkai[.min].js` file to your phone via FTP, Dropbox, ...
```

## Getting Started

First, make sure you have built the Tenkai server (instructions above.) Make sure to restart BlockLauncher. Then, open a new world and type in `/tenkai start`. It will start the server on your phone. To stop the server, type in `/tenkai stop`, and use `/tenkai restart` to restart the server if it is already running. (If it isn't running, then it will simply start the server.)

### Sending Files

Next, you must determine the local network IP of your phone. Normally, this starts with `10.`, however, this may not be the case for you. Generally, you can find this in the WiFi settings of your phone, or your router webpage.

Next, run the client of your choice, supplying your phone's local IP and the filename of the file to send. When your phone receives the file, it will instantly be enabled. If your script was already on the phone, then it will become re-enabled on the fly.

### Erroring Scripts

If a script you sent threw an error, Tenkai will print it the error message. It will continue to accept connections to the server. Because of this, you can simply resend the (fixed) script and it will automatically be evaluated.

### The server is stuck!

If you are sending files and the server doesn't do anything, then it may be stuck in limbo. This occurs when a client or client library disconnects from the server but fails to inform the server before doing so. You can fix this by simply restarting BlockLauncher, or typing in `/tenkai restart` to restart the server.
