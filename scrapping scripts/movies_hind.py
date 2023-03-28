import requests
import requests as req
from bs4 import BeautifulSoup
import bs4
import json
import csv
import pymongo
myclient = pymongo.MongoClient("mongodb+srv://puttanpal:puttanpal@cluster0.ntabq.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["test"]
mycol = mydb["movies"]

# scraping data for top 250 shows
page = req.get('https://www.imdb.com/india/top-rated-indian-movies/')
print(page.status_code)
soup = BeautifulSoup(page.content, 'html.parser')
content = soup.find_all('table')
rows = content[0].find_all('tr')
headers = []
for header in rows[0].find_all('th'):
    headers.append(header.get_text())
headers = headers[1:-1]

rows = rows[1:-1]
actors = {}  # this is a global list to store all the characters that we encountered
data = []
for row in rows:
    a_tags = row.find_all('a')
    img_tags = row.find_all('img')[0]['src']
    strong_tags = row.find_all('strong')[0].get_text()
    title = a_tags[1].get_text()
    jump_url = a_tags[0]['href']
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
    jump_url = "https://www.imdb.com" + jump_url
    page2 = requests.get(jump_url, headers=HEADERS)
    pics = []
    description = ""
    category = ''
    time = ''
    casts_arr = []
    if page2.status_code == 200:
        soup2 = BeautifulSoup(page2.content, 'html.parser')
        images = soup2.find_all('img', class_="ipc-image")
        for image in images[0:10]:
            pics.append(image['src'])
        summary = soup2.find_all('div', class_='ipc-html-content-inner-div')
        for val in summary:
            description = description + val.get_text()
        try:
            genre_div = soup2.find_all('div', class_='sc-663f405c-2')[0]
            genre_div = genre_div.find_all('div', class_='sc-663f405c-4')[0]
            genre_div = genre_div.find_all('div', class_='sc-6cc92269-9')[0]
            genre_div = genre_div.find_all('a')
            genres = soup2.find_all('a', class_='sc-6cc92269-3')
            for genre in genres:
                tags = genre.find_all('span', class_='ipc-chip__text')
            category.append(tags[0].get_text())


        except Exception as e:
            category = ['comedy', 'horror', 'drama', 'action']
        time = 0
        casts = soup2.find_all('div', class_='sc-bfec09a1-5 kUzsHJ')
        for cast in casts:
            detail = cast.find_all('div', class_='sc-bfec09a1-7 dpBDvu')
            jump_link = detail[0].find_all('a', class_='sc-bfec09a1-1')[0]['href']
            jump_link = "https://www.imdb.com" + jump_link
            li = detail[0].find_all('a', class_='sc-bfec09a1-1')
            if len(li) > 0:
                actor_name = li[0].text
            else:
                actor_name = ''
            name = detail[0].find_all('span', class_='sc-bfec09a1-4')
            if len(name) > 0:
                name = name[0].text
            else:
                name = ''
            img_div = cast.find_all('div', class_='sc-bfec09a1-6')
            if len(img_div) == 1:
                try:
                    image = img_div[0].find_all('img', class_='ipc-image')[0]['src']
                except Exception as e:
                    image = ''
            else:
                image = ''
            casts_arr.append(
                {'character_name': name,'image': image, 'actor_name': actor_name})
            if actor_name not in actors.keys():
                actors[actor_name] = jump_link
            else:
                print('the actor is already present in list')


    else:
        print(f'unable to fetch page for {title}')
    data.append({"title": title, "images": pics, "description": description, "category": category, "time": time,
                  "casts": casts_arr, 'likeCount': 0, 'movieListCount': 0, 'viewCount': 0, 'rank': -1})
    try:
        mycol.insert_one(
            {"title": title, "images": pics, "description": description, "category": category, "time": time,
             "casts": casts_arr})
    except Exception as e:
        print(e)

print('This is the final data', len(data))
try:
    print('This is the final data \n')
    for dat in data:
        print(dat)
    jsonString = json.dumps(data)
    jsonFile = open("movies.json", "a")
    jsonFile.write(jsonString)
    jsonFile.close()

except Exception as e:
    print(e)
    print('Unable to write the data to the files')