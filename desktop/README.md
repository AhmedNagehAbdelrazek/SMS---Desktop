
# SMS - Desktop

Student Management System

  
## important steps to Take before starting the project

  

First install all the packages by:

`npm i`   or

`yarn add`

  

make sure the node_modules in ./releases/app is there

if not

```
cd release/app
npm install
npx electron-rebuild -w sqlite3
```
to chack if the server is up
netstat -an | find "3000"
