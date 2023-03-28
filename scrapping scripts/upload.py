import json
import pymongo
myclient = pymongo.MongoClient("mongodb+srv://puttanpal:puttanpal@cluster0.ntabq.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["test"]
mycol = mydb["actors"]
with open('./final_actors.json') as f:
    data = json.load(f)
    new_data = []
    for key in data.keys():
        temp_data = data[key]
        temp_data['name'] = key
        try:
            mycol.insert_one(temp_data)
        except Exception as e:
            print(temp_data)
