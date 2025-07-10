import axios from 'axios';

export default async function handler(req, res) {
  const { ktype } = req.query;
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopDomain || !accessToken) {
    return res.status(500).json({ error: 'Missing Shopify environment variables' });
  }

  try {
    // 1. Get all products (paginated if needed later)
    const productResponse = await axios.get(
      `https://${shopDomain}/admin/api/2023-04/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,title,handle',
          limit: 250
        }
      }
    );

    const matchingProducts = [];

    // 2. Loop through each product and fetch metafields
    for (const product of productResponse.data.products) {
      try {
        const metafieldsResponse = await axios.get(
          `https://${shopDomain}/admin/api/2023-04/products/${product.id}/metafields.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken
            }
          }
        );

        const ktypeField = metafieldsResponse.data.metafields.find(
          (m) => m.namespace === 'fitment' && m.key === 'ktype'
        );

        if (ktypeField && ktypeField.value.split(',').includes(ktype)) {
          matchingProducts.push({
            id: product.id,
            title: product.title,
            handle: product.handle,
            url: `https://${shopDomain}/products/${product.handle}`
          });
        }
      } catch (metafieldError) {
        console.warn(`Skipping product ${product.id} due to metafield error:`, metafieldError.message);
      }
    }

    return res.status(200).json({ products: matchingProducts });
  } catch (error) {
    console.error('Shopify API error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch from Shopify' });
  }
}
