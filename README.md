# ProductsApp Backend (Serverless Node.js + AWS Lambda)

This is the backend for ProductsApp, a serverless e-commerce application built with:
- AWS Lambda
- AWS S3
- AWS API Gateway
- MySQL (RDS / local)
- Node.js 18.x
- AWS SAM CLI for local development

---

## 📦 Project Structure

project-root/
├── template.yaml              ← SAM template 
├── common-layer/              ← Shared code (Layer)
│   └── nodejs/
│       └── lib/
│           ├── db.js
│           └── userUtils.js
├── registerUser/
│   ├── index.js
│   └── package.json
├── loginUser/
│   ├── index.js
│   └── package.json
└── ...


## 🧩 Prerequisites (Install First)

- [Node.js](https://nodejs.org/) (v18.x preferred)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- AWS Account (for deploying Lambda + S3 + API Gateway)
- Docker (only if you want to emulate Lambda fully


## 🛠 Install Project Dependencies

After cloning the project:

```bash
# Move into backend folder
cd products-task-backend/

# Install common layer dependencies
cd common-layer/nodejs/
npm install
cd ../../

sam build
sam local start-api


