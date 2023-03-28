# this is the final file for the scrapped actor data

import bs4
from bs4 import BeautifulSoup
import requests as req
import json
import pymongo
myclient = pymongo.MongoClient("mongodb+srv://puttanpal:puttanpal@cluster0.ntabq.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["test"]
mycol = mydb["actors"]
file = ''

files = ['./final1.json', './final2.json', './final3.json', './final4.json', './final5.json', './final6.json']
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
for file in files:
    final_data = {}
    with open(file) as f:
        data = json.load(f)
        for val in data:
            try:
                bio_link = data[val][0][0]
                img_link = data[val][0][1]
                # fetching the bio
                phy_attributes = {}
                min_bio = ''
                family_dat = []
                trivia = []
                pictures = []
                try:
                    bio_page = req.get(bio_link, headers=HEADERS, timeout=180) #s etting a timeout of 3 minutes
                    if bio_page.status_code == 200:
                        try:
                            bio = BeautifulSoup(bio_page.content, 'html.parser')
                            phy = bio.find_all('table', id='overviewTable')[0]
                            vals = phy.find_all('td')
                            location = vals[1].find_all('a')
                            destination = ""
                            for locate in location:
                                destination = destination + " " + locate.get_text()
                            phy_attributes[vals[0].get_text()] = destination
                            phy_attributes[vals[2].get_text()] = vals[3].get_text()
                            phy_attributes[vals[4].get_text()] = vals[5].get_text()
                            min_bio = bio.find_all('p')[0].get_text()
                            try:
                                family = bio.find_all('table', id='tableFamily')[0]
                                families = family.find_all('tr')
                                for fam in families:
                                    fam_temp = []
                                    temp_data = fam.find_all('td')
                                    title = temp_data[0].text
                                    mems = temp_data[1].find_all('a')
                                    for mem in mems:
                                        fam_temp.append(mem.text)
                                    family_dat.append([title, fam_temp])
                            except Exception as e:
                                family_dat = []

                            try:
                                trivs = bio.find_all('div', class_=['soda odd', 'soda even'])
                                for triv in trivs:
                                    trivia.append(triv.text)
                            except Exception as e:
                                trivia = []
                        except Exception as e:
                            continue
                except Exception as e:
                    continue
                # fetching the images

                img_page = req.get(img_link, headers=HEADERS, timeout=180) # setting up a timeout of 3 minutes
                if img_page.status_code == 200:
                    image = BeautifulSoup(img_page.content, 'html.parser')
                    container = image.find_all('div', class_='media_index_thumb_list')[0]
                    links =  container.find_all('a')
                    images = container.find_all('img')
                    for img, link in zip(images, links):
                        try:
                            title = link['title']
                            large_img = "https://www.imdb.com//" + link['href']
                            small_img = img['src']
                            pictures.append({title: {'large': large_img, 'small': small_img}})

                        except Exception as e:
                            print('unable to fetch image', e)
                            continue

                else:
                    print(f'unable to fetch page for {img_page.status_code}',val)

                final_data[val] = {"phy_attributes": phy_attributes, "bio": min_bio, "family": family_dat,
                                   "trivia": trivia, 'images': pictures}
                try:
                    mycol.insert_one({'name':val,"phy_attributes": phy_attributes, "bio": min_bio, "family": family_dat,
                                   "trivia": trivia, 'images': pictures})
                except Exception as e:
                    print(e)
                print(f'collected data for {val}')
            except Exception as e:
              print(e,val)
    jsonString = json.dumps(final_data, indent=4)
    jsonFile = open("final_actors.json", "a")
    jsonFile.write(jsonString)
    jsonFile.close()
















