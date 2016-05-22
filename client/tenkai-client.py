import socket
import sys
import base64

class TenkaiClient(object):
    def __init__(self, ip, port=4989):
        self.ip = ip
        self.port = port
        self.sock = None

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            self.sock.connect((self.ip, self.port))
        except ConnectionRefusedError as e:
            print("[-] Failed to connect to server: {}".format(e))
            sys.exit(-1)

    def identify(self, type_):
        self.send("IDN " + type_)

    def send_file(self, filename):
        fp = open(filename, "r")
        contents = fp.read()
        # Tenkai servers use Base64 encoding.
        enccontents = base64.b64encode(bytes(contents, "utf-8"))

        # Send FIL command.
        self.send("FIL " + enccontents.decode("utf-8") + " " + filename)
        print("[+] Sent {}".format(filename))

    def send(self, str_):
        self.sock.send(bytes(str_ + "\n", "utf-8"))

    def disconnect(self):
        self.send("BRK") # Tell the client we are leaving.
        self.sock.close()
        self.sock = None

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: tenkai-client.py [ip] [file]")
        sys.exit(-1)

    tnk = TenkaiClient(sys.argv[1])
    tnk.connect()
    tnk.identify("TenkaiClientPython")
    tnk.send_file(sys.argv[2])
    tnk.disconnect()
