# MaternAlert Backend Deployment Guide (Hugging Face Spaces)

This guide covers the deployment of the MaternAlert backend as a persistent, Docker-based environment on Hugging Face Spaces. This setup ensures 99.9% uptime for background tasks and cron jobs.

## 🚀 Deployment Steps

### 1. Prepare Hugging Face Space
1. Create a new Space on [Hugging Face](https://huggingface.co/new-space).
2. Choose **Docker** as the SDK.
3. Select the **Blank** template or **NestJS** if available.
4. Choose your hardware (the free tier is sufficient for this backend).

### 2. Configure Environment Variables
In your Space settings, add the following secrets:
- `DATABASE_URL`: Your production PostgreSQL connection string.
- `JWT_SECRET`: A strong secret for token signing.
- `EXPO_ACCESS_TOKEN`: Your Expo access token for push notifications.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: SMTP credentials for email alerts.
- `FRONTEND_URL`: The URL of your deployed frontend.

### 3. Deploy Code
1. Clone the Space repository.
2. Copy the contents of the `maternalert-be` directory into the Space repository.
3. Ensure the `Dockerfile` and `.dockerignore` are in the root of the Space repository.
4. Push your changes to the Space.

## 🕒 Scheduled Tasks (Cron Jobs)
The backend is configured with `@nestjs/schedule` to run the following persistent tasks:
- **Daily Inactivity Check**: Runs at midnight to remind users who haven't logged BP in 5 days.
- **Trend Analysis**: Runs daily at 1 AM to detect dangerous BP patterns.
- **4-Hour Follow-Up**: Runs every 30 minutes to check for missed rechecks after elevated readings.

## 🏥 Health & Monitoring
- **Health Endpoint**: Access `https://your-space-url/api/v1/health` to verify service status and uptime.
- **Logs**: Monitor execution logs directly in the Hugging Face Space "Logs" tab.

## 🛠 Troubleshooting
- **Cold Starts**: Hugging Face Spaces stay active as long as they receive traffic or are configured as "Persistent." Ensure the Space is set to "Public" or "Private" with persistence enabled.
- **Database Connectivity**: Verify that your database allows connections from the Hugging Face IP range.
- **Permissions**: The Dockerfile is configured to run as a non-root user (UID 1000) as required by Hugging Face.
