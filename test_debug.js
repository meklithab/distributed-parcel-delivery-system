
async function run() {
    try {
        console.log("1. Logging in...");
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test_order_flow@example.com",
                password: "password123"
            })
        });

        if (!loginRes.ok) {
            console.error("Login failed:", loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Token:", token ? "Found" : "Missing");

        console.log("2. Creating Order...");
        const orderRes = await fetch('http://localhost:3002/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pickup_lat: 9.0320,
                pickup_lng: 38.7469,
                dropoff_lat: 9.0054,
                dropoff_lng: 38.7636,
                receiver_name: "Test Receiver",
                receiver_phone: "+251911223344",
                price: 100
            })
        });

        console.log("Order Response Status:", orderRes.status);
        const orderText = await orderRes.text();
        console.log("Order Response Data (Raw):", orderText);

    } catch (err) {
        console.error("Error:", err.message);
    }
}

run();
