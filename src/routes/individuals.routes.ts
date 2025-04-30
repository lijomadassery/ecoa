try {
  // ... existing code ...
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
  console.error('Unknown error:', error);
  return res.status(500).json({ error: 'An unknown error occurred' });
} 