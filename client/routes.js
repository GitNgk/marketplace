const routes = require('next-routes')();

routes.add('/stores/new','/stores/new');
routes.add('/stores/:address','/stores/show');
routes.add('/stores/:address/requests','/stores/requests/index');
routes.add('/stores/:address/requests/new','/stores/requests/new');
routes.add('/stores/:address/requests/:sku/update','/stores/requests/update');
routes.add('/stores/:address/requests/:sku/buy','/stores/requests/buy');
routes.add('/stores/:address/requests/:sku/bid','/stores/requests/bid');
routes.add('/orders/:address','/orders/index');
routes.add('/orders/:address/requests/:sku/:orderId/update','/orders/requests/update');
module.exports = routes;
