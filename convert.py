#!/usr/bin/env python3

from bs4 import BeautifulSoup as BS
import requests
import subprocess
import base64
import os
import yaml
import hashlib
import re
import imghdr


getstring = lambda i: "".join([e for e in i.stripped_strings])


def downloadImage(url, outputpath, overwrite=False):
    exts = [".png", ".gif", ".jpg", ".webp", ".jpeg"]

    filename_core = base64.urlsafe_b64encode(url.encode("ascii")
        ).decode("ascii")
    for ext in exts: # wont download if already
        savepath = os.path.join(outputpath, filename_core + ext)
        if os.path.isfile(savepath):
            print("Exists: %s" % url)
            return filename_core + ext


    tempsavepath = os.path.join(outputpath, filename_core + ".temp")
    cmds = [
        "curl", url, "--output", tempsavepath,
        "-H", 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0',
        "-H", 'Accept: */*',
        "-H", 'Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        "-H", 'Referer: https://mp.weixin.qq.com/',
        "-H", 'Origin: https://mp.weixin.qq.com',
        "-H", 'Pragma: no-cache',
        "-H", 'Cache-Control: no-cache',
    ]
    subprocess.run(cmds)

    imgtype = imghdr.what(tempsavepath)
    if not imgtype: imgtype = "jpeg"
    savepath = tempsavepath[:-4] + imgtype

    subprocess.call(["mv", tempsavepath, savepath])
    filename = filename_core + "." + imgtype
    return filename


def filterMeta(metadata, script):
    scriptcontent = str(script).strip()

    if "publish_time" in scriptcontent:
        search = re.search("20[0-9]{2}\\-(0[1-9]|1[0-2])\\-[0-3][0-9]", scriptcontent)
        if search:
            date = search[0]
            metadata["publish_time"] = date


def downloadAndModifyCSSWithImage(oldCSS):
    parts = oldCSS.split(";")
    for i in range(0, len(parts)):
        if not parts[i].startswith("background-image:"): continue
        try:
            url = re.search("url\\(\"?([^\"]+)\"?\\)", parts[i])[1]
            assert url.startswith("http:") or url.startswith("https:")
            print("CSS Image: %s" % url)
        except Exception as e:
            print(e)
            continue

        filename = downloadImage(url, "data/images/")
        newUrl = "/data/images/" + filename
        parts[i] = "background-image: url(%s)" % newUrl
    return ";".join(parts)
    



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

    metacontent = doc.find(id="meta_content")
    if metacontent:
        for span in metacontent.find_all("span", class_="rich_media_meta"):
            if "id" in span.attrs:
                if span.attrs["id"] == "copyright_logo": continue
                if span.attrs["id"] == "profileBt":
                    metadata["publisher"] = getstring(span.find(id="js_name"))
            else:
                metadata["author"] = getstring(span)

    metamapping = {
        "og:title": "title",
        "og:article:author": "author",
    }
    for meta in doc.find_all("meta"):
        if "property" in meta.attrs and meta.attrs["property"] in metamapping:
            metadata[metamapping[meta.attrs["property"]]] = meta.attrs["content"]
    
    # extract metadata from script
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

    for tag in doc.find_all(style=True):
        if "background-image" not in tag.attrs["style"]: continue
        tag.attrs["style"] = downloadAndModifyCSSWithImage(tag.attrs["style"])

    metadata["author"] = [metadata["author"]]
    
    return b"---\n%s\n---\n%s" % (
        yaml.dump(metadata, default_flow_style=False).encode("utf-8"),
        doc.body.encode_contents(formatter="html")
    ), metadata


if __name__ == "__main__":
    foods = os.listdir("food/")
    existing = "|".join(os.listdir("_posts/"))

    for f in foods:
        if f.endswith(".txt"): continue
        if f.endswith(".swp"): continue
        fnamehash = hashlib.sha256(f.encode("utf-8")).hexdigest()
        if fnamehash in existing:
            print("Skip: %s" % f)
            continue

        filepath = os.path.join("food", f)
        if not os.path.isfile(filepath): continue

        print("Processing: %s" % filepath)

        content, metadata = convert(open(filepath, "r").read())
        newname = "%s-%s.html" % (
            metadata["publish_time"],
            fnamehash
        )

        open(os.path.join("_posts", newname), "wb+").write(content)
