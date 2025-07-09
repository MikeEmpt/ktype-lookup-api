const axios = require('axios');

module.exports = async (req, res) => {
  const { ktype } = req.query;

  const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!ktype) {
    return res.status(400).json({ error: 'Missing ktype parameter' });
  }

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
    res.status(200).json({ products });

  } catch (error) {
    console.error('Shopify Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Shopify' });
  }
};

