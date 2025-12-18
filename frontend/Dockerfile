FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the frontend in dev mode, bound to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
