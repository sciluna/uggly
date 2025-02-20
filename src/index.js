import express from 'express';
import { config } from 'dotenv';
import { TokenJS } from 'token.js'
import path from 'path';
import cors from 'cors';
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
		let graph = body["graph"];
		let description = body["userDescription"];
		let image = body["image"];

		// Create the Token.js client
		const tokenjs = new TokenJS({
			//baseURL: 'http://127.0.0.1:11434/v1/'
		});

		let provider = "openai";
		let model = "";

		if (provider == "openai") {
			model = "gpt-4o";
		} else if (provider == "gemini") {
			model = "gemini-1.5-pro";
		} else if (provider == "openai-compatible") {
			model = "llama3.2-vision";
		}

		let messagesArray = generateMessage(graph, description, image);

		async function main() {
			const response = await tokenjs.chat.completions.create({
				provider: provider,
				model: model,
				messages: messagesArray
			});
			let answer = response.choices[0]["message"]["content"];
			console.log(answer);
			answer = answer.replaceAll('```json', '');
			answer = answer.replaceAll('```', '');
			return res.status(200).send(JSON.stringify(answer));
		}
		main();
	});
});

let generateMessage = function (graph, description, image) {
  let sampleGraph = `n0 n1\nn1 n2\nn2 n3\nn3 n4\nn4 n5\nn5 n6`;
  let messagesArray = [
    {
      role: 'system', content: 'You are a helpful and professional assistant for generating constraints for the graph layout algorithms to use.'
    },
    {
      role: "user",
      content: [
        { type: 'text', text: 'I have the following graph: \n' + graph + '. I have drawn a shape in the given image to guide the layout of the graph. I want my graph to have a layout where the nodes positioned like the overall shape in this image. Analyze the image, identify the lines and their relationships, and decide how to distribute the graph\'s nodes along the identified lines. Please generate the required placements of the nodes in the correct placement order in JSON format as in the following example output: { "explanation": detailed reasoning behind the result, "lines": [\n\
            {\n\
                "id": 0,\n\
                "start": [x1, y1],\n\
                "end": [x2, y2],\n\
                "nodes": ["n1", "n2"]\n\
            },\n\
            {\n\
                "id": 1,\n\
                "start": [x2, y2],\n\
                "end": [x3, y3],\n\
                "nodes": ["n3", "n4", "n5"]\n\
            }\n\
            {\n\
                "id": 2,\n\
                "start": [x3, y3],\n\
                "end": [x4, y4],\n\
                "nodes": ["n6", "n7"]\n\
            }\n\
            {\n\
                "id": 3,\n\
                "start": [x4, y4],\n\
                "end": [x5, y5],\n\
                "nodes": ["n8", "n9"]\n\
            }\n\
        ],\n\: Consider that x axis increases from left to right and y axis increases from top to bottom. So if a node should be placed on top of another node, it means that its y value is smaller. Please DO NOT add any other explanations. Take your time and produce answer carefully!' },
        {
          type: 'image_url', image_url: { "url": image }
        }
      ]
    }
    /*       {
            role: "user",
            content: [
              { type: 'text', text: "Can you tell me directions of the line in this image?" },
              {
                type: 'image_url', image_url: { "url": image }
              }
            ]
          } */
/*             {
              role: "user",
              content: [
                { type: 'text', text: "I have the following graph: " + graph + " where node labels are shown in paranthesis after node ids. I am using a graph layout algorithm that uses relative placement constraints and alignment constraints to position desired nodes accordingly. It accepts the relative placement constraints in the following format: relativePlacementConstraint: [{top: 'n1', bottom: 'n2'}, {left: 'n3', right: 'n4'}] where n1, n2, etc. are node ids and means that n1 should be placed on top of n2 and n3 should be placed on left of n4. It accepts alignment constraints in the following format: alignmentConstraint: {vertical: [['n1', 'n2', 'n3'], ['n4', 'n5']], horizontal: [['n2', 'n4']]} where vertical and horizontal alignments are grouped separately. I want my graph to have a layout in this description: " + description + ". Can you please generate required constraints for the algorithm in JSON format: { 'explanation': reasoning behind the result, 'relativePlacementConstraint': array of constraints in JSON format as mentioned, 'alignmentConstraint': object of constraints in JSON format as mentioned }. You do not have to use both constraint types, use them when needed. Please DO NOT add any other explanations." },
              ]
            } */
  ];
  return messagesArray;
};

export { port, app }