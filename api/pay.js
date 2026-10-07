export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    const { action, payload } = req.body;
    const API_KEY = 'csbpaynsIVOZMnQbyQZowjbyk2sRwcgD5zBukErfl5VFc4jJHX';

    try {
        if (action === 'create') {
            // PHP cURL কাঠামোর হুবহু পেলোড
            const requestBody = {
                amount: String(payload.amount),
                success_url: payload.success_url,
                cancel_url: payload.cancel_url,
                webhook_url: payload.webhook_url,
                metadata: {
                    phone: String(payload.phone || '')
                }
            };

            const response = await fetch('https://csbverify.csbservice.top/api/payment/create', {
                method: 'POST',
                headers: {
                    'API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            return res.status(200).json(data);
        } 
        
        if (action === 'verify') {
            const response = await fetch('https://csbverify.csbservice.top/api/payment/verify', {
                method: 'POST',
                headers: {
                    'API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transaction_id: String(payload.transaction_id)
                })
            });

            const data = await response.json();
            return res.status(200).json(data);
        }

        return res.status(400).json({ status: 'error', message: 'Invalid Action' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
