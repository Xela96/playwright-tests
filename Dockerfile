# Use the official Playwright image with all browsers and dependencies
FROM mcr.microsoft.com/playwright:v1.54.1-jammy

# Set working directory inside the container
WORKDIR /app

# Copy only package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your project files
COPY . .

# Run Playwright tests in headless mode
CMD ["npx", "playwright", "test", "--reporter=html", "--output", "playwright-report"]