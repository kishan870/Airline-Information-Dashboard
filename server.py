from flask import Flask, render_template, request, redirect
import json
import os
from datetime import datetime
#from FE_escalations import *
#from sla2_feonlyVASANTH import *

app = Flask(__name__)

path = os.getcwd() + '\\static\\JSON\\escalations.json'

def gen_table(escalations,filter='Date'):
    key_list = [filter]
    date_list = []
    researcher_list = []
    total_count = {}
    for escalation in escalations:
        date = escalation[filter]
        if date not in date_list:
            date_list.append(date)
        researcher = escalation['Handled By']
        if researcher not in researcher_list:
            researcher_list.append(researcher)
            total_count[researcher]=0
            key_list.append(researcher)
    research_count_list= []
    for date in date_list:
      dic = {}
      if filter=='Date':
          d = datetime.strptime(date,'%Y-%m-%d')
          d = d.strftime('%d-%b-%Y')
          dic[filter]=d
      else:
          dic[filter]=date
      for researcher in researcher_list:
        dic[researcher]=0
      for escalation in escalations:
        if escalation[filter]==date:
            researcher = escalation['Handled By']
            dic[researcher]=dic[researcher]+1
            total_count[researcher]=total_count[researcher]+1
      research_count_list.append(dic)
    total_count[filter]='Total'
    research_count_list.append(total_count)
    return research_count_list


@app.route('/',methods=['GET','POST'])
def index():
    fromDate = request.args.get('from')
    toDate = request.args.get('to')
    """
    if fromDate==None or toDate==None:
        fromDate="none"
        toDate="none"
        #escalations = get_escalations()
    else:
        escalations = get_escalations(fromDate,toDate)
    """
    #with open(path,'w') as f:
    #    json.dump(escalations,f)
    #f.close()
    return render_template('start.html')

@app.route('/researcher_count',methods=['GET','POST'])
def researcher_count():
    fromDate = request.args.get('from')
    toDate = request.args.get('to')
    if fromDate==None or toDate==None:
        fromDate="none"
        toDate="none"
        escalations = get_escalations()
    else:
        escalations = get_escalations(fromDate,toDate)
    filter = request.args.get('filter')
    if filter=='Day':
        filter='Date'
    if filter==None:
        key_list = ['Date']
        research_count_list = gen_table(escalations)
    else:
        research_count_list = gen_table(escalations,filter)
        key_list = [filter]
    dic = research_count_list[0]
    for key in dic.keys():
        if key not in key_list:
            key_list.append(key)
    return render_template('researcher.html',key_list=key_list,research_count=research_count_list)

@app.route('/sla',methods=['GET','POST'])
def sla():
    weekno = request.args.get('weekno')
    sla_selected = request.args.get('sla_selected')
    if weekno is not None:
        message = get_SLA_FEOnly(sla_selected,weekno)
    else:
        message = get_SLA_FEOnly(sla_selected)
    content = '<h3>'+str(message.Subject)+'</h3>'
    content = content+message.Html
    return render_template('sla.html',message=content)


if __name__ == "__main__":
    app.run(host = '0.0.0.0',debug=True)
