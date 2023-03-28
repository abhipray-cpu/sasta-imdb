import requests
import requests as req
from bs4 import BeautifulSoup
import bs4
import json
import csv

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
    jump_url = "https://www.imdb.com" + jump_url
    '''
    we are unable to access the page since the spider is identified as a crapper therefore the status code 403
    so we are no trying to use a fake user agent with every request
    '''
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
    page2 = requests.get(jump_url, headers=HEADERS)
    pics = []
    description = ""
    category = ''
    time = ''
    casts_arr = []
    eps = ''
    duration = ''
    season = ''
    if page2.status_code == 200:
        soup2 = BeautifulSoup(page2.content, 'html.parser')
        images = soup2.find_all('img', class_="ipc-image")
        for image in images[0:10]:
            pics.append(image['src'])
        summary = soup2.find_all('div', class_='ipc-html-content-inner-div')
        for val in summary:
            description = description + val.get_text()
        genres = soup2.find_all('a', class_='sc-16ede01-3')
        for genre in genres:
            tags = genre.find_all('span', class_='ipc-chip__text')
            category = tags[0].get_text()
        casts = soup2.find_all('div', class_='sc-36c36dd0-6 ewJBXI')
        # scrapping the number of episodes
        eps = soup2.find_all('h3')[0].text[8:]
        # scrapping number of seasons
        ses = soup2.find_all('select', id='browse-episodes-season')
        if len(ses) > 0:
            season = ses[0]['aria-label'][0:1]
        else:
            season = 1

        # scrapping how long the show lasted
        dur = soup2.find_all('select', id='browse-episodes-year')
        if len(dur) > 0:
            duration = dur[0]['aria-label'][0:1]
        else:
            duration = 1

        for cast in casts:
            detail = cast.find_all('div', class_='sc-36c36dd0-8 fSYMLK')
            jump_link = detail[0].find_all('a', class_='sc-36c36dd0-1 QSQgP')[0]['href']
            jump_link = "https://www.imdb.com" + jump_link
            li = detail[0].find_all('li', class_='ipc-inline-list__item')
            if len(li) > 0:
                name = li[0].find_all('span', class_='sc-36c36dd0-4 hGTQna')[0].get_text()
            else:
                name = ''

            eps = detail[0].find_all('a', class_='title-cast-item__eps-toggle')
            if len(eps) > 0:
                episodes = eps[0].find_all('span', class_='title-cast-item__episodes')[0].get_text()
            else:
                episodes = []
            cast_image = cast.find_all('img', class_='ipc-image')
            if len(cast_image) > 0:
                cast_image = cast_image[0]['src']
            else:
                cast_image = []
            actor_name = detail[0].find_all('span', class_='sc-36c36dd0-4 hGTQna')
            if len(actor_name) > 0:
                actor_name = actor_name[0].get_text()
            else:
                actor_name = ''
            casts_arr.append(
                {'character_name': name, 'eps': episodes, 'image': cast_image, 'actor_name': actor_name})
            if actor_name not in actors.keys():
                actors[actor_name] = jump_link
            else:
                print('the actor is already present in list')


    else:
        print(f'unable to fetch page for {title}')
    data.append({'title': title, 'images': pics, 'description': description,
                 'episodes': eps, 'season': season, 'duration': duration, 'category': category,
                 'casts': casts_arr, 'likeCount': 0, 'movieListCount': 0, 'viewCount': 0, 'rank': -1})





try:
    print(f'THis is the final data that will be written to the file')
    for dat in data:
        print(dat)
    jsonString = json.dumps(data)
    jsonFile = open("series_eng.json", "w")
    jsonFile.write(jsonString)
    jsonFile.close()

    jsonString = json.dumps(actors, indent=4)
    jsonFile = open("actors_new.json", "w")
    jsonFile.write(jsonString)
    jsonFile.close()

except Exception as e:
    print('unable to write to the file')
    print(e)



# go to link using selenium from there need to fetch cast and 10 photos to display,type,storyline,details,tech specs


# create a dataframe,json and csv format storage to store the data
