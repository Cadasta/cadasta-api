###EC2 Details
**IP:**  
54.69.121.180  

**PEM:**  
[cadasta-api.pem](https://media.taiga.io/attachments/2/9/6/b/9897dce234060800ec0c965a52fbf41c5d980104c6364f39dccd44c5b6b7/cadasta-api.pem)


*ssh example*    

     ssh -i /path/to/your/copy/of/cadasta-api.pem  ubuntu@54.69.121.180  


### Debugging in Webstorm
Create a Node.js run configuration. Configuration settings should look something like this:

![image](https://media.taiga.io/attachments/9/0/c/f/c016ef1a7871b34fae073ad2081a195e548bf1920646c9832bfe052cf54e/webstorm-api-debug-config.png)