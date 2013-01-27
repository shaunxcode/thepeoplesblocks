tileSize = 50
width = 8 
height = 8 
displayHeight = tileSize * width
displayWidth = tileSize * height
stage = new Kinetic.Stage
	container: 'world'
	width: displayWidth
	height: displayHeight + 80

gridPos = (evt) ->
	x: Math.floor(evt.pageX / tileSize)
	y: Math.floor(evt.pageY / tileSize)
        
gridLayer = new Kinetic.Layer

for x in [0..displayWidth] by tileSize
	gridLayer.add new Kinetic.Line 
		points: [x-0.5, 0, x-0.5, displayHeight]
		stroke: "black"
		strokeWidth: 1

for y in [0..displayHeight] by tileSize
	gridLayer.add new Kinetic.Line
		points: [0, y-0.5, displayWidth, y-0.5]
		stroke: "black"
		strokeWidth: 1
    
stage.add gridLayer

tilesLayer = new Kinetic.Layer
stage.add tilesLayer

addTile = (piece, pos) ->
	tilesLayer.add tile = new Kinetic.Image
		image: tileImages[piece]
		x: (pos.x * tileSize)
		y: (pos.y * tileSize)
		width: 50
		height: 50
		draggable: true
		dragBoundFunc: (pos) ->
			x: (if pos.x < 0 then 0 else pos.x)
			y: (if pos.y < 0 then 0 else pos.y)
        

	tilesLayer.draw()
        
	tile.on "dragend", (evt) ->
		pos = gridPos evt
    
		tile.setX (pos.x * tileSize) 
		tile.setY (pos.y * tileSize)
		tilesLayer.draw()
    
	tile.on "mouseover", ->
		document.body.style.cursor = 'pointer'
    
	tile.on "mouseout", ->
		document.body.style.cursor = 'default'


tileImages = {}
tilePieces = {}

count = 0
for p, rotations of {straight: [0, 90], corner: [270, 0, 90, 180], intersection: [0]}
	for r in rotations
		piece = piece = "#{p}-#{r}"
		do (piece, ogx = (count * tileSize), ogy = (height * tileSize)) ->
			tileImages[piece] = new Image
			tilesLayer.add placeHolder = new Kinetic.Image
				x: ogx
				y: ogy
				width: tileSize
				height: tileSize

			tileImages[piece].onload = ->
				placeHolder.setImage tileImages[piece]
				tilesLayer.add tilePieces[piece] = placeHolder.clone()
				placeHolder.applyFilter Kinetic.Filters.Grayscale, null, -> tilesLayer.draw()
				tilePieces[piece].setDraggable true
				tilePieces[piece].on "dragend", (evt) ->
					tilePieces[piece].setX ogx
					tilePieces[piece].setY ogy
					addTile piece, gridPos evt
				
				tilePieces[piece].on "mouseover", ->
					document.body.style.cursor = 'pointer'

				tilePieces[piece].on "mouseout", ->
					document.body.style.cursor = 'default'
						
			tileImages[piece].src = "images/#{piece}.png"
			count++