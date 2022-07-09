# Running a sample application with OpenTelemetry -

The sample nodejs application's microservices:

1. book-service
2. dashboard-service

Below are the steps to run the sample nodejs application with OpenTelemetry:

1. Install all required dependencies -
Install all the required dependencies for the application using npm. Also, install typescript and ts-node-dev globally.

```javascript
npm install
npm install -g typescript
npm install -g ts-node-dev
```

2. Setup -

tracing.ts file - In order to instrument our services, we have to create a single tracing.ts file and use it to instrument all services. The tracing setup and configuration should be run before your application code. To initialize OpenTelemetry by using the code as shown below:

```javascript
import init from './tracing'
const { sdk } = init('book-service')
```

3. Run the application -

Run both services: 

- `npm run books`
-  `npm run dashboard`

Send API calls: 

- `http://localhost:3000/books`
-  `http://localhost:3001/dashboard`

