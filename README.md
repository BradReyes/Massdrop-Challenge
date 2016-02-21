# Massdrop-Challenge
Create a job queue whose workers fetch data from a URL and ....

The update didn't chnage much except add the request queue. Again, run MongoDB first with:
mongod --dbpath data

and app.js with nodemon app.js (or just node).

/create needs a POST request. I used curl on the command line to do this. The one argument the request needs 
is 'url', such as url=https://google.com in the case of google.com.

/status is a GET request that takes an id given as a response when creating a job. Just say: 
localhost:3000/status/c7b920f57e553df2bb68272f61570210 as an example.

The rest of the code is well commented, so look at the code (which isn't too long) for implementation details.
