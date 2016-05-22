# tenkai (展開)

Develop ModPE scripts on your PC, deploy them on your phone instantly over the air.

## How this works

`tenkai-server.js` runs on your phone, in BlockLauncher. It is a TCP server that runs in the background, on a separate thread.
It receives commands from your computer, using a client. There may be multiple clients in the future, but right now, there is only one.

- `tenkai-client.py`
	- Tenkai client written in Python.
	- Usage: `tenkai-client.py [phone ip] [js file to send]`

When the server (your phone) receives a new file, it decodes it and imports the `.js` file on the fly.
This makes development with a PC much easier.

## TODO

- [ ] File watcher, send files automatically
- [ ] Compress file in packet
- [ ] Actual CLI

