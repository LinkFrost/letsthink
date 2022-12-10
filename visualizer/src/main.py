from typing import Union
import pika

from fastapi import FastAPI


def initRabbit():
    exchange = "event-bus"
    queue = "visualizer"
    eventKeys = ["RoomExpired"]

    eventBusConnection = pika.BlockingConnection(
        pika.ConnectionParameters(
            pika.ConnectionParameters(
                host='localhost', port="5672"
            )
        )
    )

    eventBusChannel = eventBusConnection.channel()

    eventBusChannel.exchange_declare(
        exchange=exchange, exchange_type="direct", durable=False)

    eventBusChannel.queue_declare(queue=queue)

    for key in eventKeys:
        eventBusChannel.queue_bind(
            queue=queue, exchange=exchange,  routing_key=key
        )

    return eventBusChannel


app = FastAPI()

# eventBusChannel = initRabbit()


@ app.get("/")
def read_root():

    return {"Hello": "World"}


@ app.get("/test")
def read_item():
    return {"Testing": "hot reload"}
