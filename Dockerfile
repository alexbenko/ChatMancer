# Dockerfile
# Stage 1: Build frontend
FROM node:14 AS frontend-builder

WORKDIR /app/web

COPY web/package*.json ./
RUN npm install

COPY web/ .
RUN npm run build && \
    rm -rf /app/web

# Stage 2: Set up Flask container
FROM python:3.9-slim

WORKDIR /app

# Create the data directory and set permissions
RUN mkdir /app/data && \
    chown -R www-data:www-data /app/data && \
    chmod -R 770 /app/data

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy static folder contents from the root directory
COPY static/ /app/static/

# Copy remaining application files
COPY . .

# Use Gunicorn for deployment
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--user=www-data", "--group=www-data", "--capture-output", "--enable-stdio-inheritance", "app:app"]
