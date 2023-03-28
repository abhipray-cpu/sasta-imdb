import requests as req
from bs4 import BeautifulSoup
# downloading the web page for scrapping

page = req.get("https://en.wikipedia.org/wiki/Augmented_reality")
# print the request code and if it is 200 then the page is successfully downloaded
print(page.status_code)
soup = BeautifulSoup(page.content, 'html.parser')

# to find all the instances of a tag we use : find_all this returns a list
for element in soup.find_all('p'):
    print(element.get_text())

# we can also search for elements using class and id

for element in soup.find_all(class_='info'):
    print(element.get_text())

for element in soup.find_all(id="intro"):
    print(element.get_text())

# if you are getting 403 forbidden error then make sure to attach a header to the request
