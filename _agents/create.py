#!/usr/bin/env python3

import argparse
import yaml
import re
import os
import random

parser = argparse.ArgumentParser()

parser.add_argument("faction", choices=["R", "E", "r", "e", "res", "enl"])
parser.add_argument("id", type=str)
parser.add_argument("-c", type=str, required=True)

args = parser.parse_args()

args.id = args.id.strip()
if not re.match("[0-9a-z\\_]{1,16}", args.id.lower()):
    print("Invalid agent id.")
    exit(1)

if os.path.exists(args.id + ".md"):
    print(args.id + ".md -> file exists.")
    exit(2)

coordinates = ""
if args.c:
    matchCoordinates = re.search("(\\-?[0-9]{1,3}(\\.[0-9]+)?)\\,(\\-?[0-9]{1,3}(\\.[0-9]+)?)", args.c)
    if matchCoordinates:
        lat, lng = matchCoordinates[1], matchCoordinates[3]
        coordinates = "%.3f,%.3f" % (
            float(lat) + (random.random() - 0.5) / 100,       # add random error @ 1000m
            float(lng) + (random.random() - 0.5) / 100 * 1.5  # same random error, compensated for latitude
        )

output = {
    "title": args.id,
    "agent_id": args.id,
    "faction": "res" if args.faction.lower().startswith("r") else "enl",
    "layout": "agent",
    "coordinate": coordinates
}

frontmatter = yaml.dump(output, default_flow_style=False)
doc = ("""
---
%s
---

%s""" % (frontmatter, args.id)).strip()

open("%s.md" % args.id, "w").write(doc)
print(doc)
