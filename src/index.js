import express from 'express';
import { config } from 'dotenv';
import fs from 'fs';
import { TokenJS } from 'token.js';
import path from 'path';
import cors from 'cors';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

// Create a web server
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "../public/")));
app.use(cors());

// Define a route to handle llm query
app.post('/llm', async (req, res) => {
	let body = "";
	req.on('data', data => {
		body += data;
	});

	req.on('end', async () => {
		body = JSON.parse(body);
		let image = body["image"];
    let llmMode = body["llmMode"];
    let withAscii = body["withAscii"];

/*     const baseUrl = 'https://github.com/hasanbalci/uggly-test/blob/main/drawings/';
    const baseUrl2 = 'https://github.com/hasanbalci/uggly-test/blob/main/results/';

    const filePath = path.join(__dirname, '/graph-drawing.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    let drawingArray = [];
    fileContent.split('\n').forEach((line) => {
      if (line.trim() !== '') {
        const parts = line.split(' ');
        const drawingFilename = parts[1];
        const drawingUrl = baseUrl + '/' + drawingFilename + '?raw=true';
        drawingArray.push(drawingUrl);
      }
    });

    console.log(drawingArray[0]);
    const files = fs.readdirSync(path.join(__dirname, "/results"));
    console.log(files[0]);
    let csvData = [];
    let count = 0;
    for (let i = 0; i < files.length; i=i+5) {
      for (let j = i; j < i + 5; j++) {
        for (let k = j+1; k < i + 5; k++) {
          let filename1 = path.parse(files[j]).name;
          let filename2 = path.parse(files[k]).name;
          csvData.push({drawingUrl: drawingArray[count], first: baseUrl2 + filename1 + '.png?raw=true', second: baseUrl2 + filename2 + '.png?raw=true', llmType1: filename1.match(/drawing\d+_(.+)/)[1], llmType2: filename2.match(/drawing\d+_(.+)/)[1]});
        }
      }
      count++;
    }
    const shuffled = csvData.sort(() => 0.5 - Math.random());
    let sampledArray = shuffled.slice(0, 500);
    sampledArray.forEach(sample => {
      let rand = Math.random();
      if(rand < 0.5) {
        let temp1 = sample.first;
        sample.first = sample.second;
        sample.second = temp1;
        let temp2 = sample.llmType1;
        sample.llmType1 = sample.llmType2;
        sample.llmType2 = temp2;
      }
    });
    sampledArray = jsonToCsv(sampledArray);
    fs.writeFileSync('./ugly_data.csv', sampledArray, 'utf8');

    // Convert JSON to CSV manually
    function jsonToCsv(jsonData) {
      let csv = '';
      
      // Extract headers
      const headers = Object.keys(jsonData[0]);
      csv += headers.join(',') + '\n';
      
      // Extract values
      jsonData.forEach(obj => {
          const values = headers.map(header => obj[header]);
          csv += values.join(',') + '\n';
      });
      
      return csv;
    } */

    // Convert the base64 string into ascii grid representation
    let asciiText = await imageToAscii(image, 24)
      .then((asciiArt) => {
          return asciiArt;
      })
      .catch((err) => {
          console.error('Error loading image:', err);
      });

		// Create the Token.js client
		const client = new TokenJS();

		let provider = llmMode;
		let model = "";

		if (provider == "openai") {
			model = "gpt-4o";
		} else if (provider == "gemini") {
			model = "gemini-2.0-flash-001";
		} else if (provider == "openai-compatible") {
			model = "llama3.2-vision";
		} else if (provider == "bedrock") {
      model = "anthropic.claude-3-sonnet-20240229-v1:0";
    }
    let messagesArray = "";
    if (withAscii) {
      messagesArray = generateMessage(image, asciiText);
    } else {
      messagesArray = generateMessage2(image);
    }

		async function main1() {
			const response = await client.chat.completions.create({
        provider: provider,
				model: model,
				messages: messagesArray,
        top_p: 0.1,
        temperature: 0
			});
			let answer = response.choices[0]["message"]["content"];
			console.log(answer);
			answer = answer.replaceAll('```json', '');
			answer = answer.replaceAll('```', '');
			return res.status(200).send(JSON.stringify(answer));
		}

    main1();
	});
});

let generateMessage = function (image, asciiText) {
  let systemPrompt = {
    role: 'system', content: 'You are a helpful and professional assistant for extracting lines from a given image with a hand-drawn shape!'
  };
  let userPrompt = {
    role: "user",
    content: [
      { type: 'text', text: 'I have drawn a shape in the given image and I want you to analyze the image, identify the lines and their relationships and provide me an ordered list of lines with start and end coordinates. While identifying lines, be consistent with the given image. To aid your analysis, I am also providing an ASCII grid representation of the image, where "o" represents empty spaces and "x" represents the path of the drawn lines: \n' + asciiText + 'Do not consider slight changes in the direction of the lines since the drawing is made by hand and each line may not be drawn linearly (THIS IS IMPORTANT). Please generate the output in the following JSON format: \n{ "explanation": detailed reasoning behind the result, \n "lines": [\n\
          {\n\
              "start": [x1, y1],\n\
              "end": [x2, y2],\n\
          },\n\
          {\n\
              "start": [x2, y2],\n\
              "end": [x3, y3],\n\
          }\n\
          {\n\
              "start": [x3, y3],\n\
              "end": [x4, y4],\n\
          }\n\
          ...\n\
      ],\nwhere x1, y1, x2, y2. etc. are real coordinates. Consider that x axis increases from left to right and y axis increases from top to bottom. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!' },
      {
        type: 'image_url', image_url: { "url": image }
      }
    ]
  }
  console.log(userPrompt.content[0].text);

  let messagesArray = [];
  messagesArray.push(systemPrompt);
  messagesArray.push(userPrompt);
  return messagesArray;
};

let generateMessage2 = function (image) {
  let systemPrompt = {
    role: 'system', content: 'You are a helpful and professional assistant for extracting lines from a given image with a hand-drawn shape!'
  };
  let userPrompt = {
    role: "user",
    content: [
      { type: 'text', text: 'I have drawn a shape in the given image and I want you to analyze the image, identify the lines and their relationships and provide me an ordered list of lines with start and end coordinates. While identifying lines, be consistent with the given image. Do not consider slight changes in the direction of the lines since the drawing is made by hand and each line may not be drawn linearly (THIS IS IMPORTANT). Please generate the output in the following JSON format: \n{ "explanation": detailed reasoning behind the result, \n "lines": [\n\
          {\n\
              "start": [x1, y1],\n\
              "end": [x2, y2],\n\
          },\n\
          {\n\
              "start": [x2, y2],\n\
              "end": [x3, y3],\n\
          }\n\
          {\n\
              "start": [x3, y3],\n\
              "end": [x4, y4],\n\
          }\n\
          ...\n\
      ],\nwhere x1, y1, x2, y2. etc. are real coordinates. Consider that x axis increases from left to right and y axis increases from top to bottom. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!' },
      {
        type: 'image_url', image_url: { "url": image }
      }
    ]
  }
  console.log(userPrompt.content[0].text);

  let messagesArray = [];
  messagesArray.push(systemPrompt);
  messagesArray.push(userPrompt);
  return messagesArray;
};

async function imageToAscii(base64Image, height = 16) {
  // Convert base64 to a buffer
  const imageBuffer = Buffer.from(base64Image.split(",")[1], "base64");

  // Process the image with Sharp
  let { data, info } = await sharp(imageBuffer)
    .resize({
        height: 16,
        fit: 'inside', // Ensures aspect ratio is maintained
    })
    .grayscale()
    .threshold(220)
    .raw()
    //.toFile('asciiImage16.png');
    .toBuffer({ resolveWithObject: true });
    console.log(info);
    //fs.writeFileSync('asciiImage16.png', data);

/*     let { data: data2, info: info2 } = await sharp(imageBuffer)
    .resize({
        height: 48,
        fit: 'inside', // Ensures aspect ratio is maintained
    })
    .grayscale()
    .threshold(220)
    .toFile('asciiImage48.png');
    //fs.writeFileSync('asciiImage48.png', data2);

    const { data: data3, info: info3 } = await sharp(imageBuffer)
    .resize({
        height: 64,
        fit: 'inside', // Ensures aspect ratio is maintained
    })
    .grayscale()
    .threshold(220)
    .toFile('asciiImage64.png');
    //fs.writeFileSync('asciiImage64.png', data3);

    const { data: data4, info: info4 } = await sharp(imageBuffer)
    .resize({
        height: 32,
        fit: 'inside', // Ensures aspect ratio is maintained
    })
    .grayscale()
    .threshold(220)
    .toFile('asciiImage32.png');
    //fs.writeFileSync('asciiImage32.png', data4);

    const { data: data5, info: info5 } = await sharp(imageBuffer)
    .resize({
        height: 24,
        fit: 'inside', // Ensures aspect ratio is maintained
    })
    .grayscale()
    .threshold(220)
    .toFile('asciiImage24.png');
    //fs.writeFileSync('asciiImage24.png', data5); */

    let asciiArt = '';
    const threshold = 128; // Adjust if necessary

    for (let i = 0; i < data.length; i++) {
        const brightness = data[i]; // Since it's grayscale, we only have one channel

        asciiArt += brightness < threshold ? 'x' : 'o';

        // Add a newline at the end of each row
        if ((i + 1) % info.width === 0) {
            asciiArt += '\n';
        }
    }

  return asciiArt;
}

export { port, app }