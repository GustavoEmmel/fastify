FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the project files into the container
COPY . .

# Install project dependencies
RUN pnpm install

# Build the project
RUN pnpm build

# Expose the application port
EXPOSE 3000

# Default command for the container
CMD ["pnpm", "run", "start"]
