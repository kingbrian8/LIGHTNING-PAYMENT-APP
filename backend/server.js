const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes (Mocked for Demo)
app.get('/api/status', (req, res) => {
    res.json({ status: 'healthy', network: 'lightning', provider: 'Voltage' });
});

// Mock Invoice Creation
app.post('/api/invoices', (req, res) => {
    const { amountZar, reference } = req.body;
    const amountSats = Math.round(amountZar * 66.67); // Example rate
    const invoiceId = 'inv-' + Math.random().toString(36).substr(2, 9);

    res.json({
        id: invoiceId,
        amountZar,
        amountSats,
        reference,
        status: 'pending',
        paymentRequest: 'lnbc' + Math.random().toString(36).repeat(4) // Mock LN invoice
    });
});

// Mock Refund Processing
app.post('/api/refunds', (req, res) => {
    const { txId, amountZar } = req.body;
    res.json({
        success: true,
        message: 'Refund of R ' + amountZar + ' processed for ' + txId,
        refundId: 'rf-' + Math.random().toString(36).substr(2, 9)
    });
});

// Fallback to SPA index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Lightning POS backend running at http://localhost:${PORT}`);
});
