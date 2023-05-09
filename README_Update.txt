cd postgres

create a .env file containing
TELEGRAM_AUTH_TOKEN=<your_telegram_auth_token>

-----
WINDOWS
From the windows powershell:

Build the geo-collector-bot:latest image on your local machine using the Dockerfile (While Docker Desktop is running)
From "Users/..../geocollectorbot" run:
 	docker build -t geo-collector-bot .

Start the 2 containers (postgres-1 and bot-1) 
From "Users/.../geocollectorbot/examples/postgres"
 	docker-compose up

---
Create Postgres Server through pgAdmin

Servers > Create > Server
General
Name: 			anything

Connection
Host name/address: 	Localhost
Port:				5438
Username:			root

----
Problem with creation of the geo-collector-DB after the very first start of the postgres-1 container

LOG message (in Docker Desktop):
/usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01-init.sh
PostgreSQL Database directory appears to contain a database; Skipping initialization

(eventhough the DB does infact not exist yet)

For Windows:
Solution: Make the PostgreSQL initialisation script executable
Docker Desktop > Terminal (of postgres-1 container)

chmod +x ./scripts/01-init.sh 	# make the file executable

bash 01-init.sh 				# execute the file

For Linux:
Run the above 1st command in the terminal

(After the first run of the container the DB is created and exists and will not be created again)


