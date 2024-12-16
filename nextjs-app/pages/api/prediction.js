import { exec } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { streetName, betweenStreets, dayOfWeek, month, intervalOfDay, dayOfMonth } = req.body;

    if (!streetName || !betweenStreets || !dayOfWeek || !month || intervalOfDay === undefined || dayOfMonth === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pythonScript = path.join(process.cwd(), 'scripts', 'predict.py');
    const pythonExecutable = path.join(process.cwd(), 'env', 'bin', 'python3');
    const command = `${pythonExecutable} ${pythonScript} "${streetName}" "${betweenStreets}" "${dayOfWeek}" "${month}" ${intervalOfDay} ${dayOfMonth}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: `Error executing script: ${error.message}` });
      }

      if (stderr) {
        return res.status(500).json({ error: `stderr: ${stderr}` });
      }

      try {
        const result = JSON.parse(stdout.trim());
        res.status(200).json({ prediction: result.result, confidenceScore: result.confidenceScore });
      } catch (err) {
        return res.status(500).json({ error: 'Error parsing prediction result.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
