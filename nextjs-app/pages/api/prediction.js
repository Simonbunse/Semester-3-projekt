import { exec } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Destructure input from the request body
    const { streetName, betweenStreets, dayOfWeek, month, intervalOfDay, dayOfMonth } = req.body;

    // Ensure all required fields are present
    if (!streetName || !betweenStreets || !dayOfWeek || !month || intervalOfDay === undefined || dayOfMonth === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare the command to run the Python script
    const pythonScript = path.join(process.cwd(), 'scripts', 'predict.py');
    const pythonExecutable = path.join(process.cwd(), 'env', 'bin', 'python3');  // Full path to the virtual environment's Python
    const command = `${pythonExecutable} ${pythonScript} "${streetName}" "${betweenStreets}" "${dayOfWeek}" "${month}" ${intervalOfDay} ${dayOfMonth}`;

    // Execute the Python script
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: `Error executing script: ${error.message}` });
      }

      if (stderr) {
        return res.status(500).json({ error: `stderr: ${stderr}` });
      }

      // Parse the output as JSON
      try {
        const result = JSON.parse(stdout.trim());
        // Send the result and confidence score to the frontend
        res.status(200).json({ prediction: result.result, confidenceScore: result.confidenceScore });
      } catch (err) {
        return res.status(500).json({ error: 'Error parsing prediction result.' });
      }
    });
  } else {
    // Method Not Allowed
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
