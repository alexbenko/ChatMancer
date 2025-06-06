# Stage 1: Build the React application
FROM node:23-slim AS build

WORKDIR /app

COPY ./web/package.json ./web/package-lock.json ./

RUN npm install

COPY ./web ./

RUN npm run build

# Stage 2: Set up the Python server
FROM python:3.13-alpine

WORKDIR /app

# Install system dependencies required for Python, Rust, and C++
RUN apk add --no-cache gcc g++ musl-dev libffi-dev openssl-dev cargo rust

# Copy the Python server files
COPY ./api .
COPY --from=build /app/dist ./dist

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENV ENVIORNMENT=production

CMD ["python", "main.py"]