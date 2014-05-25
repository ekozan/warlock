Warlock
===========

A private PaaS project for developer ;)

Api
--------------------

Users

* http(s)://${Host}:${Port}/users GET return list of users [ADMIN]
* http(s)://${Host}:${Port}/users POST create user
* http(s)://${Host}:${Port}/users/login POST login user
* http(s)://${Host}:${Port}/users/${user-name} GET user [ADMIN] if not you

Apps

* http(s)://${Host}:${Port}/apps GET return list of apps
* http(s)://${Host}:${Port}/apps POST Create app 
* http(s)://${Host}:${Port}/apps/available GET 
* http(s)://${Host}:${Port}/apps/${app-name} GET 
* http(s)://${Host}:${Port}/apps/${app-name} PUT 
* http(s)://${Host}:${Port}/apps/${app-name} DELETE 
* http(s)://${Host}:${Port}/apps/${app-name}/snapshots GET
* http(s)://${Host}:${Port}/apps/${app-name}/snapshots POST
* http(s)://${Host}:${Port}/apps/${app-name}/snapshots/activate POST 
* http(s)://${Host}:${Port}/apps/${app-name}/snapshots/${snapshot-name} GET 
* http(s)://${Host}:${Port}/apps/${app-name}/snapshots/${snapshot-name} DELETE 
