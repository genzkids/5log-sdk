# 5Log Software Development Kit - Client

We 🫶 NodeJS

This is the official NodeJS SDK for 5log, a cloud based logging and bug tracking app


## Installation

#### 👉 Using NPM
```bash
# install locally (recommended)
npm i --save 5log-sdk
```

#### 👉 Usage
```javascript
// ES6
import { filog } from '5log-sdk'

// init
const log = new Logging([
    { client_id: '{your-client-id}', url: 'https://logs.devops.io/api/v1/logs', logType: 'ANY' }
    // if you want to separate log into different api service you can add more options
    { client_id: '{your-client-id}', url: 'https://error.devops.io/api/v1/logs', logType: 'ERROR' }
])

// Test Scenario
function JsonParse (value) {
    try {
        return JSON.parse(value)
    } catch (error) {
        log.write({
            logLevel: 'ERROR',
            source: {
                app_name: '{{your-app-name}}',
                package_name: '{{your-package-name}}',
                app_version: '{{app-version}}',
            },
            errorDescription: error,
            environment: '{{your-environment}}',
            eventCode: 'ERR-2180'
        }, { 
            // options for printout original error and error print out
            verbose: 'true', 
            originalError: error
        })
    }
}

JsonParse("{a;b}");
```


