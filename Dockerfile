# Base Image (using full Debian Bookworm Python image which has curl, git, and build tools pre-installed)
FROM python:3.12-bookworm

# Configure apt to retry downloads on transient network/DNS issues (fixes error 100)
RUN echo "Acquire::Retries \"5\";" > /etc/apt/apt.conf.d/80-retries

# Install OpenJDK 17 (for Java runner support)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS version) for frontend building
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json* ./
COPY backend/requirements.txt ./backend/requirements.txt

# Install frontend and backend dependencies
RUN npm install
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy all source files
COPY . .

# Build Vite frontend assets into dist/
RUN npm run build-frontend

# Expose port and run uvicorn
EXPOSE 8000
ENV PORT=8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
