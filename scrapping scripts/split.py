# this script will sclit the large actors.json file into multiple files

import json
with open('./actors.json') as f:
    data = json.load(f)
    i = 1
    # splitting into different files of size 1000
    data_parsed = {}
    for key in data.keys():
        if i % 1000 == 0:
            jsonString = json.dumps(data_parsed)
            jsonFile = open(f"data_parse{i}.json", "w")
            jsonFile.write(jsonString)
            jsonFile.close()
            data_parsed = {}
        data_parsed[key] = data[key]
        i=i+1