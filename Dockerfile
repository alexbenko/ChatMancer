# Stage 1: Build the React application
FROM node:19 as build

WORKDIR /app

COPY ./web/package.json ./web/package-lock.json ./

RUN npm install

COPY ./web ./

RUN npm run build

# Stage 2: Set up the Python server
FROM python:3.9-slim

WORKDIR /app

# Copy the Python server files
COPY ./api .
COPY --from=build /app/dist ./dist
# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENV ENVIORNMENT production

CMD ["python", "main.py"]
