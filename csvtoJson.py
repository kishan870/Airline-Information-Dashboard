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
    if row["Sex"] == "M":
        dict["Sex"] = "Male"
    elif row["Sex"] == "F":
        dict["Sex"] = "Female"
    else:
        dict["Sex"] = "Unknown"
    dict["Team"] = row["Team"]
    dict["Year"] = int(row["Year"])
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

sorted_list = sorted(dict_list, key=lambda x: x["Year"])

print(out_path)
with open(out_path,'w') as out:
    json.dump(sorted_list, out)
