# Team BlazinglyFast

## letsthink

letsthink offers a way for people to receive feedback from their audiences, through either polls or an anonymous message board in a room. These rooms then expire after a set amount of time, and the results can be viewed afterwards either on the site, or through a visualization that is generated and sent to the user’s email address.

This app was built using microservice architecture, with multiple services connected using messages through RabbitMQ. It features a frontend created in Next.js with TailwindCSS.

Team Overview:

- [LinkFrost](https://github.com/LinkFrost)
- [jackbisceglia](https://github.com/jackbisceglia)
- [joepetrillo](https://github.com/joepetrillo)
- [sid2033](https://github.com/sid2033)

## How To Run

`docker compose -p letsthink up`

### Local Development

We have included a `install_modules.sh` shell script to install all node modules for every service locally. This is not required to run the app with docker compose, but is needed for developing locally or running individual services through npm. 
