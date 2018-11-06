#!/usr/bin/env python3

from bs4 import BeautifulSoup as BS
import requests
import subprocess
import base64
import os
import yaml
import hashlib
import imghdr


getstring = lambda i: "".join([e for e in i.stripped_strings])


def downloadImage(url, outputpath, overwrite=False):
    exts = [".png", ".gif", ".jpg", ".webp", ".jpeg"]

    filename_core = base64.urlsafe_b64encode(url.encode("ascii")
        ).decode("ascii")
    for ext in exts: # wont download if already
        savepath = os.path.join(outputpath, filename_core + ext)
        if os.path.isfile(savepath): return filename_core + ext

    tempsavepath = os.path.join(outputpath, filename_core + ".temp")
    subprocess.run([
        "curl", url, "--output", tempsavepath,
        "-H", 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0',
        "-H", 'Accept: */*',
        "-H", 'Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        "-H", 'Referer: https://mp.weixin.qq.com/',
        "-H", 'Origin: https://mp.weixin.qq.com',
        "-H", 'Pragma: no-cache',
        "-H", 'Cache-Control: no-cache',
    ])

    imgtype = imghdr.what(tempsavepath)
    if not imgtype: imgtype = "jpeg"
    savepath = tempsavepath[:-4] + imgtype

    subprocess.call(["mv", tempsavepath, savepath])
    filename = filename_core + "." + imgtype
    return filename


def filterMeta(metadata, script):
    lines = str(script).strip().split("\n")
    for l in lines:
        l = l.strip()
        if l.startswith("var publish_time"):
            metadata["publish_time"] = l.split("\"")[1]


def convert(html):
    doc = BS(html, "lxml")

    bin2utf8 = lambda b: b.decode("utf-8")

    metadata = {
        "publish_time": "",
        "layout": "post",
        "title": getstring(doc.find("title")),
        "author": "Unknown",
        "publisher": "Unknown",
    }

    for span in doc.find(id="meta_content").find_all("span", class_="rich_media_meta"):
        if "id" in span.attrs:
            if span.attrs["id"] == "copyright_logo": continue
            if span.attrs["id"] == "profileBt":
                metadata["publisher"] = getstring(span.find(id="js_name"))
        else:
            metadata["author"] = getstring(span)

    for script in doc.find_all("script"):
        filterMeta(metadata, script)
        script.decompose()

    for hreftag in doc.find_all(href=True):
        if hreftag["href"].endswith(".ico"): hreftag.decompose()

    for tag in doc.find_all("img"):
        if "data-src" in tag.attrs:
            url = tag.attrs["data-src"]
            filename = downloadImage(url, "data/images/")
            newUrl = "/data/images/" + filename
            tag["src"] = newUrl
    
    return b"---\n%s\n---\n%s" % (
        yaml.dump(metadata, default_flow_style=False).encode("utf-8"),
        doc.body.encode_contents(formatter="html")
    ), metadata


if __name__ == "__main__":
    foods = os.listdir("food/")
    for f in foods:
        if f.endswith(".txt"): continue
        filepath = os.path.join("food", f)
        if not os.path.isfile(filepath): continue

        content, metadata = convert(open(filepath, "r").read())
        newname = "%s-%s.html" % (
            metadata["publish_time"],
            hashlib.sha256(f.encode("utf-8")).hexdigest()
        )

        open(os.path.join("_posts", newname), "wb+").write(content)
