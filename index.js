const express = require('express');
var Jimp = require('jimp');
const app = express();

app.get('/', (req, res) => {
	if (!req.query.q){
		res.json({error: "No image provided, provide one through a 'q' parameter."});
		// Because it returns, theoretically no error.
		// Wait, I'm going to make a git repo, then you can just edit this
		return;
	}
	// Read file from ?q url, and account for cors through my proxy
  Jimp.read("https://cors.explosionscratc.repl.co/" + req.query.q.replace(/^(?:http|https)\:\/\//, ""))
  .then(async (image) => {
		if (req.query.width || req.query.height){
			let mode = req.query.mode || req.query["resize-mode"];
			if (mode === "cover"){
				let width = +req.query.width || Jimp.AUTO;
				let height = +req.query.height || Jimp.AUTO;
				image.cover(width, height)
			} else if (mode === "contain"){
				let width = +req.query.width || Jimp.AUTO;
				let height = +req.query.height || Jimp.AUTO;
				image.contain(width, height)
			} else {
				let width = +req.query.width || Jimp.AUTO;
				let height = +req.query.height || Jimp.AUTO;
				image.resize(width, height)
			}
		}
		if (req.query.greyscale){
			image.greyscale();
		}
		if (req.query.flipHorizantal || req.query.flipVertical){
			image.flip(req.query.flipHorizantal ? true :  false, req.query.flipVertical ? true :  false)
		}
		if (req.query.invert){
			image.invert();
		}
		if (req.query.brightness){
			if (+req.query.brightness > 1 || +req.query.brightness < -1){
				res.json({error: "Brightness must be between -1 and 1"});
				throw new Error("")
			}
			image.brightness(+req.query.brightness)
		}
		if (req.query.contrast){
			if (+req.query.contrast > 1 || +req.query.contrast < -1){
				res.json({error: "Contrast must be between -1 and 1"});
				throw new Error("")
			}
			image.contrast(+req.query.contrast)
		}
		if (req.query.opacity){
			if (+req.query.opacity > 1 || +req.query.opacity < -1){
				res.json({error: "Opacity must be between -1 and 1"});
				throw new Error("")
			}
			image.opacity(+req.query.opacity)
		}
		if (req.query.blur){
			image.blur(+req.query.blur);
		}
		if (req.query.posterize){
			image.posterize(+req.query.posterize)
		}
		if (req.query.rotate){
			image.rotate(+req.query.rotate)
		}
		if (req.query.crop){
			let a = req.query.crop.split(",");
			if (a.length !== 4){
				res.json({error: "Not enough arguments for crop, crop query must be in the form 'x,y,width,height'"})
				return;
			}
			a = a.map((i) => +i);
			image.crop(...a);
		}
		if (req.query.quality){
			image.quality(+req.query.quality);
		}
		if (req.query.hash) {
			res.json(image.hash(+req.query.hash));
			return;
		}
		if (req.query.scale){
			image.scale(+req.query.scale);
		}
		if (req.query.autoCrop){
			image.autocrop(+req.query.autoCrop)
		}
		if (req.query.scaleToFit){
			image.scaleToFit(...req.query.scaleToFit.split(",").slice(0,2).map(i => +i))
		}
		if (req.query.pixelate){
			image.pixelate(...req.query.pixelate.split(",").map(i => +i))
		}
		if (req.query.opaque){
			image.opaque();
		}
		if (req.query.contain){
			if (req.query.contain.split(",").length < 2){
				res.json({error: "2 arguments needed: width and height, specify them seperated by commas in the query parameter."});
				return;
			}
			image.contain(...req.query.contain.split(",").slice(0, 2).map(i => +i))
		}
		if (req.query.cover){
			if (req.query.contain.split(",").length < 2){
				res.json({error: "2 arguments needed: width and height, specify them seperated by commas in the query parameter."});
				return;
			}
			image.cover(...req.query.cover.split(",").slice(0, 2).map(i => +i))
		}
		if (req.query.dither){
			image.dither565();
		}
		let modifiers = [];
		if (req.query.hueRotate || req.query.hue){
			modifiers.push({apply: "spin", params: [+(req.query.hue || req.query.hueRotate)]})
		}
		if (req.query.darken){
			modifiers.push({apply: "darken", params: [+req.query.darken]});
		}
		if (req.query.saturate){
			modifiers.push({apply: "saturate", params: [+req.query.saturate]});
		}
		if (modifiers.length > 0){
			image.color(modifiers)
		}
		return image
	})
	.then(async (resized) => {
		let img = await resized.getBufferAsync(req.query.mime || req.query.mimeType || "image/png");
		res.writeHead(200, {
			'Content-Type': req.query.mime || req.query.mimeType || "image/png",
			'Content-Length': img.length
		});
		res.end(img);
	})
	.catch((e) => {
		console.log(e);
		try {
			res.json({error: e.message})
		} catch(e){
			// Res may be sent already
		}
	})
});

app.listen(3000, () => {
  console.log('server started');
});