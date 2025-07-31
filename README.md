# playwright-tests
A repository for playwright tests that can test multiple projects

## Requirements
- Node.js (v16 or newer)
- npm
- playwright

## Setup
- Clone repository and install dependencies
 ```
git clone https://github.com/Xela96/playwright-tests.git
cd playwright-tests
npm install
# or
yarn install
```

- Create a .env file in the root directory of the project
- Enter values for 
    - CLIENT_ID
    - CLIENT_SECRET
    - REFRESH_TOKEN

## Usage
- Navigate to the root directory of the project in a powershell/command prompt
- To run all tests  
```npx playwright test```

- To run a specific test  
```npx playwright test tests/personal-website/home.spec.ts```

- To run test by tag  
```npx playwright test --grep=@tag```
- To view the test report  
```npx playwright show-report```