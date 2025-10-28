<!-- api end points  -->

## User Endpoints
<!-- register a new user -->
POST http://localhost:5000/api/users/signup

<!-- login user -->
http://localhost:5000/api/users/signin

## Project Endpoints
GET http://localhost:5000/api/projects?page=1&limit=20&status=ongoing

GET http://localhost:5000/api/projects/freelancer/:freelancerId?status=ongoing

GET http://localhost:5000/api/projects/client/:clientId?status=completed

GET http://localhost:5000/api/projects/stats/:userId

GET http://localhost:5000/api/projects/:id

POST http://localhost:5000/api/projects

PUT http://localhost:5000/api/projects/:id

PATCH http://localhost:5000/api/projects/:id/status

POST http://localhost:5000/api/projects/:id/upload

POST http://localhost:5000/api/projects/:id/activity

DELETE http://localhost:5000/api/projects/:id


## Message/Chat Endpoints
GET http://localhost:5000/api/messages/between/:userId1/:userId2

GET http://localhost:5000/api/messages/conversations/:userId

GET http://localhost:5000/api/messages/conversations/:conversationId/messages

POST http://localhost:5000/api/messages/conversations

POST http://localhost:5000/api/messages

PATCH http://localhost:5000/api/messages/read

DELETE http://localhost:5000/api/messages/:id

## Socket.io Events
- user:join - Join with userId
- message:send - Send real-time message
- message:receive - Receive real-time message
- typing:start - Start typing indicator
- typing:stop - Stop typing indicator
- user:online - User came online
- user:offline - User went offline
