# atlas-reaper-stitch
Realm App for Atlas Reaper

# Installation

Create your [Atlas Cluster](https://cloud.mongodb.com) and [Realm App](https://cloud.mongodb.com). 

1. Take a note of the Realm App-Id `appname-xxxxx` 
1. Generate an API key pair for your project and note the public and private IDs (Access Manager/Project) from the Atlas UI
1. Whitelist your IP address for API access (through the Atlas UI)
1. Install `realm-cli`: `npm install -g mongodb-realm-cli`
1. Log in to your Atlas/Realm project: `realm-cli login --api-key=my-api-key --private-api-key=my-private-api-key`
1. Add the following to your app as Realm Secrets: 

```
realm-cli secrets add --app-id=appname-xxxxx --name=AtlasPrivateKey --value=my-atlas-private-api-key
realm-cli secrets add --app-id=appname-xxxxx --name=AtlasPublicKey --value=my-aws-public-api-key
realm-cli secrets add --app-id=appname-xxxxx --name=GoogleOAuthClientSecret --value=my-google-oath-secret
```

1. Download the Realm app code: `git clone https://github.com/JamesOsgood/atlas-reaper-realm.git`
1. Import the code and values into your Realm app: `realm-cli import --app-id=appname-xxxxx --strategy=replace --include-dependencies`
1. Or set up auto deploy from git




