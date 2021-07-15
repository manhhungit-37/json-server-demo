const jsonServer = require('json-server')
const { v4: uuidv4 } = require('uuid');

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const PORT = process.env.PORT || 4000;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.id = uuidv4();
    req.body.createdAt = Date.now()
    req.body.updatedAt = Date.now()
  }
  else if (req.method === 'PATCH') {
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next()
})

router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCount = headers['x-total-count'];
  if (req.method === 'GET' && totalCount) {
    const queryParams = queryString.parse(req._parsedUrl.query);
    const result = {
      data: res.locals.data,
      pagination: {
        page: Number(queryParams._page) || 1,
        limit: Number(queryParams._limit) || 10,
        totalCount: Number(totalCount)
      }
    }
    return res.jsonp(result)
  } else if (req.method === 'DELETE') {
    return res.jsonp({
      message: "Successfully",
    })
  }
  return res.jsonp({
    data: res.locals.data,
  })
 
}

// Use default router
server.use('/api', router)
server.listen(PORT, () => {
  console.log('JSON Server is running')
})