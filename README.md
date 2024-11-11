### Description of project:
I would like to introduce you to a project I wrote as a test task for a company called "Spaak".
This is a project where I implemented a bulletin board similar to the "Kanban" board.
The information was taken from the free source "Danish Parliament API".


### **1) Check .env file:**
```
DATABASE_URL='postgres://user:user@localhost:5432/postgres'
```

### **2) Install dependencies:**
```
npm install 
```

### **3) Run environment:**
```
npm run dev
```

### **4) Run migration:**
```
npx prisma migrate dev --name init
```

### **5) Fetch data from external endpoint:**
```
http://localhost:3000/api/save-prisma
http://localhost:3000/api/save-native
```

### **6) Check fetched records:**
```
http://localhost:3000/api/posts-prisma
http://localhost:3000/api/posts-native
```

### **7) Enter dashboard:**
```
http://localhost:3000/web/dashboard
```