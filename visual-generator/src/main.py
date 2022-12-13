import json
import boto3
import os
import math
import matplotlib.pyplot as plt
import numpy as np

from fastapi import FastAPI, HTTPException

S3_ACCESS_KEY = os.environ.get("AWS_S3_ACCESS_KEY_ID")
S3_SECRET = os.environ.get("AWS_S3_SECRET_ACCESS_KEY")

if (not S3_ACCESS_KEY) or (not S3_SECRET):
    print("NO ENV VARS FOUND")


s3_bucket_name = "letsthink-viz"
service = "s3"
region = "us-east-2"

s3_client = boto3.client(
    service_name=service,
    region_name=region,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET
)


def upload_file(file_path: str, file_key: str, file_extension: str):
    def make_image_url():
        return f"https://{s3_bucket_name}.s3.{region}.amazonaws.com/{file_key}"

    extra_args = {
        "ContentType": f"image/{file_extension}"
    }

    res = s3_client.upload_file(
        file_path, s3_bucket_name, file_key, extra_args
    )

    return make_image_url()


app = FastAPI()


@app.get("/visual")
def getVisual():
    # Fill in
    return None


@app.get("/")
def read_root():
    return {"Visualizer Listening": "Hello World"}


@app.post("/visual")
def generateVisual(reqData: dict):
    print("VISUALIZING ROOM")
    roomData = reqData["roomData"]
    roomType = roomData["room_type"]
    filePath = ''

    if roomType == "message":
        filePath = messageViz(roomData)
    elif roomType == "poll":
        filePath = pollViz(roomData)
    else:
        raise HTTPException(status_code=400, detail="invalid json payload")

    if not filePath:
        raise HTTPException(status_code=400, detail="invalid json payload")

    try:
        image_url = upload_file(
            file_path=filePath,
            file_key=filePath,
            file_extension='jpg'
        )

        os.remove(filePath)

        return {
            "imageUrl": image_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="issue processing image")


def messageViz(roomData):
    messages = roomData['messages']
    res = sorted(messages, key=lambda x: x['votes'], reverse=True)[0:3]

    # creating the dataset
    data = {m['content']:  m['votes'] for m in res}

    courses = list(data.keys())
    values = list(data.values())

    fig = plt.figure(figsize=(10, 5))

    # creating the bar plot
    plt.bar(courses, values, color='blue',
            width=0.4)

    # Setting the interval of ticks of x-axis.
    listOf_Xticks = np.arange(0, min(3, len(messages)), 1)
    plt.xticks(listOf_Xticks)

    # Setting the interval of ticks of y-axis.
    listOf_Yticks = np.arange(0, math.ceil(max(data.values()) * 1.1) + 1, 1)
    plt.yticks(listOf_Yticks)

    plt.xlabel("Messages")
    plt.ylabel("Vote Count")
    plt.title("Top Messages")
    filePath = roomData['title'] + roomData['id'] + '.jpg'
    plt.savefig(filePath)

    print("VISUALIZED MESSAGE")

    return filePath


def pollViz(roomData):

    pollOptions = roomData['poll_options']
    # creating the dataset

    if not pollOptions:
        return

    data = {pollOption['title']:  pollOption['votes']
            for pollOption in pollOptions}

    largestVal = max([pollOption['votes'] for pollOption in pollOptions])

    courses = list(data.keys())
    values = list(data.values())

    fig = plt.figure(figsize=(10, 5))

    # creating the bar plot
    plt.bar(courses, values, color='blue',
            width=0.4)

    # Setting the interval of ticks of x-axis.
    listOf_Xticks = np.arange(0, len(pollOptions), 1)
    plt.xticks(listOf_Xticks)

    # Setting the interval of ticks of y-axis.
    listOf_Yticks = np.arange(0, math.ceil(largestVal * 1.1) + 1, 1)
    plt.yticks(listOf_Yticks)

    plt.xlabel("Options")
    plt.ylabel("Vote Count")
    plt.title(f"Poll Results for {roomData['title']}")
    filePath = roomData['title'] + roomData['id'] + '.jpg'
    plt.savefig(filePath)

    print("VISUALIZED POLLS")

    return filePath


def condense(str):

    if len(str) > 10:
        str = str[:10] + '...'

    return str


@ app.on_event("startup")
def startup():
    print("VIZ GEN STARTED")
