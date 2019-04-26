'''
Python script to aggregate original data into daily averages. Since the data is updated in 10seconds in the original THERM0001.json file, I have taken 8640(6*60(minutes)*24(hours)) documents at a time, averaged them and stored in a new dictionary.
The new dictionary is then stored in a file - data_agg.json which can then be sent to the server. 
'''

import datetime
import json
with open("../THERM0001.json") as json_file:
    data  = json.load(json_file)

renewed_data = []
x = 1
sums = 0 
count = 0
for k in data:
    sums= sums + k["val"]
    x = x + 1                                                                                                                                                                                       
    if(x==8640):
        print sums
        new_dict = dict() 
        new_dict["val"] = sums/8640
        print new_dict["val"]
        new_dict["ts"] =  k["ts"]
        renewed_data.append(new_dict)
        x = 1
	
        sums =0


with open('data_agg.json', 'w') as outfile:  
    json.dump(renewed_data, outfile)
