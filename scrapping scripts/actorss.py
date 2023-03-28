# in this script we will scrap actors data
from bs4 import BeautifulSoup
import bs4
import requests as req
import json
data_parse = {}
files = ['./data_parse11000.json',  ]
for file in files:
    with open(file) as f:
        print(f'this is the file {file}')
        data = json.load(f)
        HEADERS = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }
        i = 1
        for key in data.keys():
            if key not in data_parse.keys():
                try:
                    temp = []
                    page = req.get(data[key], headers=HEADERS)
                    if page.status_code == 200:
                        soup = BeautifulSoup(page.content, 'html.parser')
                        # bio link
                        bio_link = \
                        soup.find_all('div', class_='sc-b44b1fb9-2')[1].find_all('ul', class_='sc-4549a773-0')[0]
                        bio_link = bio_link.find_all('li')[0].find_all('a')[0]['href']
                        bio_link = "https://www.imdb.com/" + bio_link
                        # pics link
                        pics = soup.find_all('div', class_='ipc-title__wrapper')[0]
                        try:
                            pics = pics.find_all('a')[0]['href']

                            pics_link = "https://www.imdb.com/" + pics
                        except Exception as e:
                            pics_link = ''
                        temp.append([bio_link, pics_link])
                        data_parse[key] = temp
                        print(key)


                    else:
                        print('unable to fetch data for ', key)
                    i = i + 1

                except Exception as e:
                    print(e)

        jsonString = json.dumps(data_parse)
        jsonFile = open("actors_intermediate.json", "a")
        jsonFile.write(jsonString)
        jsonFile.close()





