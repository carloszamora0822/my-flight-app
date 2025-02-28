# MongoDB Setup Instructions

## Why MongoDB?

When deploying a serverless application on Vercel, file-based storage won't work for data persistence because:
1. Serverless functions are ephemeral - they spin up, execute, and then are destroyed
2. Files created during function execution don't persist between invocations
3. Each new deployment creates a fresh environment

MongoDB Atlas provides a free cloud database that works perfectly with Vercel deployments.

## Setting Up MongoDB Atlas (Free Tier)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select the free tier option (M0 Sandbox)
   - Choose a cloud provider (AWS, Google Cloud, or Azure) and region
   - Click "Create Cluster" (this takes a few minutes)

3. **Set Up Database Access**
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Create a username and password (save these securely!)
   - Set privileges to "Read and Write to Any Database"
   - Click "Add User"

4. **Set Up Network Access**
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for simplicity)
   - Click "Confirm"

5. **Get Your Connection String**
   - Once your cluster is ready, click "Connect"
   - Choose "Connect your application"
   - Select "Node.js" as your driver and the latest version
   - Copy the connection string - it looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials

6. **Update Your Environment Variables**
   - Open the `.env.local` file in your project
   - Replace the placeholder connection string with your actual connection string:
     ```
     MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/vbtapp?retryWrites=true&w=majority
     MONGODB_DB=vbtapp
     ```

7. **Deploy to Vercel**
   - In your Vercel project settings, add these same environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `MONGODB_DB`: vbtapp

## Troubleshooting

* If you get connection errors, make sure your IP is allowed in Network Access
* Check that username and password are correctly URL-encoded in the connection string
* Verify you've added the environment variables to Vercel if you're having issues in production

Your application will now store data in MongoDB Atlas, ensuring that your flights and events persist across deployments and server restarts!
