const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/ktype/:id', async (req, res) => {
  const ktype = req.params.id;
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  try {
    const query = `
    {
      products(first: 50, query: "metafield:fitment.ktype:*${ktype}*") {
        edges {
          node {
            id
            title
            handle
            metafields(identifiers: [{namespace: "fitment", key: "ktype"}]) {
              value
            }
          }
        }
      }
    }`;

    const response = await fetch(`https://${shop}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    res.json(data.data.products.edges.map(edge => edge.node));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

