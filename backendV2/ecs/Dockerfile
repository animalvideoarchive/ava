FROM python:3.9-slim

# Install ffmpeg and other necessary packages
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Set the working directory in the container to /app
WORKDIR /app

COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the video processing script
COPY videoProcessing.py .

# Run ffmpeg clipping code when the container launches
CMD ["python", "videoProcessing.py"]
