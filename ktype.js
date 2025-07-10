const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Environment variables
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Test route
app.get('/', (req, res) => {
  res.send('K-Type Lookup API is running');
});

// K-Type lookup route
app.get('/ktype/:ktype', async (req, res) => {
  const ktype = req.params.ktype;

  try {
    // Get all products (adjust limit if needed)
    const response = await axios.get(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-04/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        params: {
          fields: 'id,title,handle',
          limit: 250
        }
      }
    );

    const matchingProducts = [];

    for (const product of response.data.products) {
      try {
        const metafieldsRes = await axios.get(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-04/products/${product.id}/metafields.json`,
          {
            headers: {
              "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN
            }
          }
        );

        const fitmentField = metafieldsRes.data.metafields.find(
          (m) => m.namespace === "fitment" && m.key === "ktype"
        );

        if (fitmentField && fitmentField.value.includes(ktype)) {
          matchingProducts.push(product);
        }
      } catch (err) {
        console.warn(`Skipping product ${product.id}:`, err.message);
      }
    }

    return res.json({ products: matchingProducts });

  } catch (error) {
    console.error('Shopify error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch from Shopify' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
