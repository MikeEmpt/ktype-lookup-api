const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Shopify store domain and token from Vercel environment variables
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Lookup route: /ktype/:ktype
app.get('/ktype/:ktype', async (req, res) => {
  const ktype = req.params.ktype;

  try {
    const response = await axios.post(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-04/graphql.json`,
      {
        query: `
          {
            products(first: 10, query: "metafield:fitment.ktype:*${ktype}*") {
              edges {
                node {
                  id
                  title
                  handle
                  metafields(first: 5, namespace: "fitment", keys: ["ktype"]) {
                    edges {
                      node {
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        `
      },
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        }
      }
    );

    const products = response.data.data.products.edges.map(edge => edge.node);
    res.json({ products });

  } catch (error) {
    console.error('Shopify error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Shopify' });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('K-Type Lookup API is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
