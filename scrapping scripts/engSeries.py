import requests
import requests as req
from bs4 import BeautifulSoup
import bs4
import json
import csv

import pymongo
myclient = pymongo.MongoClient("mongodb+srv://puttanpal:puttanpal@cluster0.ntabq.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["test"]
mycol = mydb["shows"]
# scraping data for top 250 shows
page = req.get('https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250')

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
    print(jump_url)
    page2 = requests.get(jump_url, headers=HEADERS, timeout=180)
    pics = []
    description = ""
    category = []
    time = ''
    casts_arr = []
    season = ''
    episodes = {} # this will contain the data of all the episodes
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
        casts = soup2.find_all('div', class_='sc-bfec09a1-5 kUzsHJ')
        for cast in casts:
            try:
                episode = cast.find_all('span', class_='sc-f3cffc35-2')[1].text
            except Exception as e:
                episode = 1
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
                {'character_name': name, 'image': image, 'actor_name': actor_name, 'episodes': episode})
            if actor_name not in actors.keys():
                actors[actor_name] = jump_link
            else:
                print('the actor is already present in list')
        # fetching the episode details
        try:
            season = soup2.find_all('div', class_='sc-93b8eec8-4 gljGUx')
            season = season[0].find_all('a')[1].text
            season = season[0:1]
        except Exception as e:
            try:
                season = soup2.find_all('div', class_='sc-93b8eec8-4 gljGUx')
                season = season[0].find_all('div',
                                            class_='ipc-simple-select ipc-simple-select--base ipc-simple-select--on-accent2')
                season = season[0].find_all('label', class_='ipc-simple-select__label')[0].text
                season = season[:len(season) - 7]
            except Exception as e:
                season = 1
        try:
            season = int(season)
        except Exception as e:
            season = 1

        if season <= 0 :
            season = 1

        ep_jump = soup2.find_all('a', class_='ipc-title-link-wrapper')[0]['href']
        ep_jump = "https://www.imdb.com" + ep_jump[:ep_jump.find('?') + 1] + 'season='
        # we will be searching for a max of 30 seasons and if we fail to get a season we will break the loop
        for i in range(1, season+1):
            eps_temp = []
            episode_jump = ep_jump + f'{i}'
            ep_page = requests.get(episode_jump, headers=HEADERS)
            if ep_page.status_code == 200:
                ep_content = BeautifulSoup(ep_page.content, 'html.parser')
                blocks = ep_content.find_all('div', class_='list_item')
                for block in blocks:
                    try:
                        ep_image = block.find_all('img')[0]['src']
                    except Exception as e:
                        ep_image = ''
                    try:
                        ep_title = block.find_all('strong')[0].find_all('a')[0].text
                    except Exception as e:
                        ep_title = ''
                    try:
                        ep_date = block.find_all('div', class_='airdate')[0].text
                    except Exception as e:
                        ep_date = ''
                    try:
                        ep_description = block.find_all('div', class_='item_description')[0].text
                    except Exception as e:
                        ep_description = ''
                    eps_temp.append({"title":ep_title, "image": ep_image, "airDate": ep_date, "description": ep_description})
                episodes[str(i)] = eps_temp

            else:
                print(f'we are breaking loop for {episode_jump}')
                break

    else:
        print(f'unable to fetch page for {title}')
    data.append({'title': title, 'images': pics, 'description': description,
                 'episodes': episodes, 'season': season, 'category': category,
                 'casts': casts_arr, 'likeCount': 0, 'movieListCount': 0, 'viewCount': 0, 'rank': -1})
    try:
        data_insert = {'title': title, 'images': pics, 'description': description, 'episodes': episodes, 'season': season, 'category': category,
                          'casts': casts_arr, 'likeCount': 0, 'movieListCount': 0, 'viewCount': 0, 'rank': -1}
        mycol.insert_one(data_insert)
    except Exception as e:
        print('unable to insert document')
        print(e)
print(data)
jsonString = json.dumps(data)
jsonFile = open("shows.json", "w")
jsonFile.write(jsonString)
jsonFile.close()

#jsonString = json.dumps(actors, indent=4)
#jsonFile = open("actors.json", "a")
#jsonFile.write(jsonString)


# go to link using selenium from there need to fetch cast and 10 photos to display,type,storyline,details,tech specs


# create a dataframe,json and csv format storage to store the data
