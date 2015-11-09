##Developer Documentation
###Running locally
 After git cloning, do a `npm install` and ```pip install -r requirements.txt``` at the repo root
  
 Next, you need to add a app/settings/settings.js and a app/settings/environment-settings.js to the repo.  See example files for details. 
 
 You can fire up the API (in development mode) with:

    > node app.js

### Debugging in Webstorm
Create a Node.js run configuration. Configuration settings should look something like this. Now you can put in breakpoints.  Then click the "bug" button in the Webstorm toolbar.

![image](https://media.taiga.io/attachments/9/0/c/f/c016ef1a7871b34fae073ad2081a195e548bf1920646c9832bfe052cf54e/webstorm-api-debug-config.png)


### Documenting Endpoints
This API is leveraging [apidoc](http://apidocjs.com/) to convert code comments above endpoint definitions to html docs. Please see [apidoc](http://apidocjs.com/) for commenting details. After adding comments, your will need to run the following Grunt task to refresh the docs (creates HTML & Markdown files).

    > grunt updateDocs


