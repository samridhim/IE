'''
Real Time data simulator. Takes today's date and keeps on adding 10 seconds to the timestamp.
Chooses from a random temprature value to send to the server at /api/realtime
'''

import json
import datetime
import requests
import time
import random

init_ts = int(time.time()) * 1000
vals = [65,66,67,68]
url = 'http://localhost:3000/api/realtime'
headers = {'content-type': 'application/json'}
while(1):
	payload = {'ts': init_ts, 'val' : random.choice(vals)}
	r = requests.post(url, data=json.dumps(payload), headers=headers)
	init_ts = init_ts + 1000
	time.sleep(10)
	
