##Developer Documentation
###Running locally
 After git cloning, do a `npm install` and ```pip install -r requirements.txt``` at the repo root.
 
 Clone [pyxform](https://github.com/XLSForm/pyxform) ```git clone https://github.com/XLSForm/pyxform.git``` to app/
  
 Next, you need to add a app/settings/settings.js and a app/settings/environment-settings.js to the repo.  See example files for details. 
 
 You can fire up the API (in development mode) with:

    > node app.js

### Debugging in Webstorm
Create a Node.js run configuration. Configuration settings should look something like this. Now you can put in breakpoints.  Then click the "bug" button in the Webstorm toolbar.

![image](https://media.taiga.io/attachments/9/0/c/f/c016ef1a7871b34fae073ad2081a195e548bf1920646c9832bfe052cf54e/webstorm-api-debug-config.png)




### Documenting Endpoints
This API is leveraging [apidoc](http://apidocjs.com/) to convert code comments above endpoint definitions to html docs. Please see [apidoc](http://apidocjs.com/) for commenting details. After adding comments, your will need to run the following Grunt task to refresh the docs (creates HTML & Markdown files).

    > grunt updateDocs



###Shipping the code to a deployment server
A Grunt task is setup to:
1) tarball all the required API code
2) SCP the tarball to the deployment specific server (staging, production, etc)
3) create a "publish" script that will install and fire up the API on its deployment server
4) SCP the "publish" script to the deployment server

The "deploy" grunt task has several required parameters:

    > grunt deploy --env <deploy type> --deployer <username> --rev <git revision/commit id> --pem <EC2's identity/pem file>


| parameter  | Description  |
|---|---|
| --env  | the deployment environment, valid values include "staging" or "production"   |
| --deployer  | your github username, this is used to track who made the deployment  |
|--rev   | the git revision/commit id; supply `git log -n 1 --pretty=format:"%H"` and bash will harvest the current commit id for you  |
| --pem | path to the .pem file required to log on to your EC2  |

Example

    > grunt deploy -env staging --deployer rgwozdz -rev `git log -n 1 --pretty=format:"%H"` --pem /path/to/cadasta-api.pem

###Extracting, installing, and firing up the API code on the server
When the task is complete you can SSH onto the deployment server and `cd` to the location of `deploy.tar.gz` and
`publish.sh`. For "staging" deployments, `cd ~/staging`, for production deployments `cd ~/production`.

If this is the first time that publish.sh has been SCP'd to the machine, you will need to:

    > sudo chmod +x publish.sh

Otherwise you can skip the chmod step and do:

    > sudo ./publish.sh

This script will:

1) clear any old API files and un-tar the `deploy.tar.gz`.
2) run an `npm install` to install any node modules dependencies (non-dev).
3) use pm2 to start/restart the node app
4) Log to rollbar that a deployment was made by you and will record the environment and git commit id.


###EC2 Details
**IP:**
54.69.121.180



*ssh example*

     ssh -i /path/to/your/copy/of/cadasta-api.pem  ubuntu@54.69.121.180
