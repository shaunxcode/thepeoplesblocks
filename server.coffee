express = require "express"

app = express()
server = app.listen 6677
app.configure ->
	app.use express.static "./public"

	app.get "/*", (req, res) -> res.sendfile "./public/index.html"
