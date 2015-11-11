#Cadasta API

The Cadasta API is based on the [Express](http://expressjs.com/) web framework for Node.js.  It connects to the Cadasta PostgreSQL database. This database contains all of the Cadasta application-specific schema entities and the schema for storing survey data imported from ONA.

###Install

The following installation instructions assume you are deploying the API to the same host that include the CKAN application and database

In the user directory, clone the following repositiories:

	# Get the Cadasta DB repo
    git clone https://github.com/Cadasta/cadasta-db.git
    
    # Get PostGIS extension
    sudo apt-get install -y postgis postgresql-9.3-postgis-2.1
    
    # Create the Database if you have not already done so
	sudo -u postgres psql -c "CREATE DATABASE cadasta_db with owner=postgres encoding='UTF-8' 
	lc_collate='en_US.utf8' lc_ctype='en_US.utf8' template template0"
	sudo -u postgres psql -c "CREATE EXTENSION postgis;" cadasta_db
	sudo -u postgres psql -U postgres -d cadasta_db -f cadasta-db/sql/1_db.sql
	sudo -u postgres psql -U postgres -d cadasta_db -f cadasta-db/sql/2_field-data-tables.sql
	sudo -u postgres psql -U postgres -d cadasta_db -f cadasta-db/sql/3_db-functions.sql
	sudo -u postgres psql -U postgres -d cadasta_db -f cadasta-db/sql/4_db-views.sql
	sudo -u postgres psql -U postgres -d cadasta_db -f cadasta-db/sql/5_validation-functions.sql
	sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '<password>'"

    
    # Get the Cadasta setting files;  stored in a private repo to keep credentials secret
    git clone https://github.com/Cadasta/cadasta-private-settings.git
    
    # Get the Cadasta Api code
    git clone https://github.com/Cadasta/cadasta-api.git
        
    cp ~/cadasta-private-settings/cadasta-api/settings.js cadasta-api/app/settings
    cp ~/cadasta-private-settings/cadasta-api/environment-settings.js cadasta-api/app/settings
    
    # Install Cadasta API
	cd ~/cadasta-api
	sudo npm install
	pip install -r requirements.txt
	grunt updateDocs
	
	# Install PM2 - used to manage the node.js API
	sudo npm install pm2 -g
	
	# Create the pm2 startup script
	pm2 startup ubuntu -u ubuntu
	sudo su -c "env PATH=$PATH:/usr/bin pm2 startup ubuntu -u ubuntu --hp /home/ubuntu"
    

	# Start the API
	sudo pm2 start app/app.js --name cadasta-api -- --env ckan
	
	# Serve the API documentation
	sudo pm2 start docs-app/app.js --name cadasta-api-docs

	# Save the pm2 "state";  these apps will be restarted on reboot
	pm2 save
	
###Re-deploy

	# Update from repos
	cd ~/cadasta-private-settings
	git pull origin master
	
	cd ~/cadasta-api
	git pull origin master
	
	# Copy private settings
	cp ~/cadasta-private-settings/cadasta-api/settings.js ~/cadasta-api/app/settings
    cp ~/cadasta-private-settings/cadasta-api/environment-settings.js ~/cadasta-api/app/settings
    
    # Install Cadasta API
	cd ~/cadasta-api
	sudo npm install
	sudo pip install -r requirements.txt
	grunt updateDocs
	
	#Restart
	sudo pm2 delete all

	# Start the API
	sudo pm2 start app/app.js --name cadasta-api -- --env ckan

	# Serve the API documentation
	sudo pm2 start docs-app/app.js --name cadasta-api-docs