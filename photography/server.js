const Tesseract = require('tesseract.js');

app.post('/verify-payment', upload.single('screenshot'), async (req, res) => {
  try {
    const { paymentCode } = req.body;
    const result = await Tesseract.recognize(
      req.file.path,
      'eng',
      { logger: m => console.log(m) }
    );
    
    const isVerified = result.data.text.includes(paymentCode);
    res.json({ verified: isVerified });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});
// Add session middleware (install express-session)
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));

// Modify the submission handler
app.post('/submit', upload.fields([
  { name: 'photo' },
  { name: 'screenshot' }
]), async (req, res) => {
  try {
    // If coming from registration page (no files yet)
    if (!req.files && req.body.name) {
      // Store registration data in session
      req.session.registrationData = req.body;
      return res.redirect('/photo_upload.html');
    }

    // If coming from photo upload page
    const data = req.session.registrationData || req.body;
    const photo = req.files['photo']?.[0];
    const screenshot = req.files['screenshot']?.[0];

    const entry = new Entry({
      ...data,
      photoPath: photo?.path || '',
      paymentScreenshotPath: screenshot?.path || '',
    });

    await entry.save();
    req.session.destroy(); // Clear session
    res.send('<h2>Submitted successfully! <a href="/">Back</a></h2>');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing your submission');
  }
});

// Add to your server.js
app.post('/submit', upload.fields([...]), async (req, res) => {
  const { paymentCode, ...otherData } = req.body;
  
  // Basic validation of payment code format
  if (!/^[A-Z0-9]{8}$/.test(paymentCode)) {
    return res.status(400).send('Invalid payment reference code');
  }

  const entry = new Entry({
    ...otherData,
    paymentCode,
    paymentVerified: false, // Can be verified later
    photoPath: req.files['photo']?.[0]?.path || '',
    paymentScreenshotPath: req.files['screenshot']?.[0]?.path || ''
  });

  await entry.save();
  res.redirect('/success.html');
});