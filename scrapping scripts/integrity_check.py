import json
l1=0
l2=0
with open('./data_parse.json') as f1:
    data1 = json.load(f1)
    l1 = len(data1)
    print(l1)



