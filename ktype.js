app.get('/ktype/:ktype', async (req, res) => {
  const ktype = req.params.ktype;

  const gqlQuery = {
    query: `
      {
        products(first: 50, query: "metafield:fitment.ktype=*${ktype}*") {
          edges {
            node {
              id
              title
              handle
              metafields(namespace: "fitment", first: 10) {
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
  };

  try {
    const response = await axios.post(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-04/graphql.json`, gqlQuery, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const products = response.data.data.products.edges.map(edge => edge.node);
    return res.status(200).json({ products });

  } catch (error) {
    console.error('Shopify error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch from Shopify' });
  }
});
