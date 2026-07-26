#!/usr/bin/env python3
"""Serve the built site locally over both IPv4 and IPv6."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket


HOST = "::"
PORT = 3002
SITE_DIRECTORY = Path(__file__).resolve().parent.parent / "dist"


class DualStackHTTPServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


def main():
    if not (SITE_DIRECTORY / "index.html").is_file():
        raise FileNotFoundError(
            f"Missing {SITE_DIRECTORY / 'index.html'}. Build the site before serving it."
        )

    handler = partial(SimpleHTTPRequestHandler, directory=str(SITE_DIRECTORY))
    with DualStackHTTPServer((HOST, PORT), handler) as server:
        print(f"Serving {SITE_DIRECTORY} at http://localhost:{PORT}/", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
