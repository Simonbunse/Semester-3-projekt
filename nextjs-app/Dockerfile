# Step 1: Use Node.js as the base image
FROM node:latest

# Step 2: Install Python and necessary dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Step 3: Create a virtual environment for Python packages
RUN python3 -m venv /app/env

# Step 4: Upgrade pip in the virtual environment
RUN /app/env/bin/pip install --upgrade pip

# Step 5: Install Python dependencies within the virtual environment
RUN /app/env/bin/pip install joblib pandas numpy scikit-learn

# Step 6: Set the working directory in the container
WORKDIR /app

# Step 7: Copy the necessary files into the container
COPY package.json package-lock.json ./ 

# Step 8: Install Node.js dependencies
RUN npm install

# Step 9: Copy the rest of the application code, including the Python script
COPY . . 

# Step 10: Expose the port for the Next.js app
EXPOSE 3000

# Step 11: Set the entry point to run the Next.js app
CMD ["npm", "run", "dev"]
