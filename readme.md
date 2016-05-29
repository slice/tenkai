# tenkai (展開)

Develop ModPE scripts on your PC, deploy them on your phone instantly over the air.

## How this works

`tenkai-server.js` runs on your phone, in BlockLauncher. It is a TCP server that runs in the background, on a separate thread.
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

**NOTE: PLEASE READ!** This software is insecure. Anybody scanning the network can evaluate JavaScript on your phone without you even knowing unless you are constantly watching your phone. This also means they can modify your SDCard. Please be aware of this; this is your only disclaimer.

Tips to not get pwned:

- Be on your own secure network.
- Don't let other people onto your network that you don't trust.

## Getting Started

First, import the `tenkai-server.js` file into BlockLauncher. Make sure to restart BlockLauncher. Then, open a new world. Type in `/tenkai start`. It will start the TCP server on your phone. You will be told when it starts. To stop the server, type in `/tenkai stop`. Make sure to do this when you are not going to use the server.

### Sending Files

Next, you must determine the local network IP of your phone. Normally, this starts with `10.`, however, this may not be the case for you. Generally, you can find this in the WiFi settings of your phone, or your router webpage.

Next, run the client of your choice, supplying your phone's local IP and the filename of the file to send. When your phone receives the file, it will instantly be enabled. If your script was already on the phone, then it will become re-enabled on the fly.

### Erroring Scripts

If a script you sent threw an error, Tenkai will print it out. It will continue to accept connections to the server. Because of this, you can simply resend the (fixed) script and it will automatically reimport.
