import csv
import json
import os

path = os.getcwd() + r'\CSV\dataset_olympics.csv'
#out_path = os.getcwd() + r'\JSON'
out_path = "Olympics.json"

reader = csv.DictReader(open(path,'r',newline=''))

dict_list = []

for row in reader:
    dict = {}
    dict["ID"] = row["ID"]
    dict["Sex"] = row["Sex"]
    dict["Team"] = row["Team"]
    dict["Year"] = row["Year"]
    dict["Season"] = row["Season"]
    dict["City"] = row["City"]
    dict["Sport"] = row["Sport"]
    if row["Age"] == '':
        dict["Age"] = "Unknown"
    else:
        age = int(float(row["Age"]))
        if age < 15:
            dict["Age"] = "Under-15"
        elif age <=20:
            dict["Age"] = "15-20"
        elif age <=25:
            dict["Age"] = "21-25"
        elif age <=30:
            dict["Age"] = "26-30"
        elif age <=35:
            dict["Age"] = "31-35"
        elif age <=40:
            dict["Age"] = "36-40"
        else:
            dict["Age"] = "Over-40"
    dict_list.append(dict)

print(out_path)
with open(out_path,'w') as out:
    json.dump(dict_list, out)
