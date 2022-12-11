import json
import boto3
import os

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


@app.get("/")
def read_root():
    return {"Visualizer Listening": "Hello World"}


@app.get("/visual")
def getVisual():
    # Fill in
    return None


@app.post("/visual")
def generateVisual(RoomData: dict):
    img_path = RoomData["img"]
    img_name = RoomData["filename"]
    img_type = RoomData["img_type"]

    if not img_path or not img_name or not img_type:
        raise HTTPException(status_code=400, detail="invalid json payload")

    try:
        image_url = upload_file(
            file_path=f"src/{img_path}",
            file_key=img_name,
            file_extension=img_type
        )

        return {
            "imageUrl": image_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="issue processing image")
