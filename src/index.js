import express from 'express';
import { config } from 'dotenv';
import { TokenJS } from 'token.js';
import OpenAI from "openai";
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { prompts } from './prompt/prompt.js'

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

/* 		// Create the Token.js client
		const client = new TokenJS({
			//baseURL: 'http://127.0.0.1:11434/v1/'
		});

		let provider = "openai";
		let model = "";

		if (provider == "openai") {
			model = "gpt-4o";
		} else if (provider == "gemini") {
			model = "gemini-2.0-flash-001";
		} else if (provider == "openai-compatible") {
			model = "llama3.2-vision";
		} else if (provider == "bedrock") {
      model = "anthropic.claude-3-sonnet-20240229-v1:0";
    } */

    const client = new OpenAI();

		let messagesArray = generateMessage(graph, description, image);

		async function main() {
			const response = await client.chat.completions.create({
				//provider: provider,
				model: 'gpt-4o',
				messages: messagesArray,
        temperature: 0
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
  let sampleGraph = `n4 n5\nn5 n6\nn6 n7\nn0 n1\nn1 n2\nn2 n3\nn3 n4\n`;
  let systemPrompt = {
    role: 'system', content: 'You are a helpful and professional assistant for mapping the nodes in a given graph to the lines in the given image.'
  };
  console.log(graph);

  let userPrompt = {
    role: "user",
    content: [
      { type: 'text', text: 'I have the following graph: \n' + graph + '. I have drawn a shape in the given image and I want my graph to have a layout where the nodes positioned like the overall shape in this image. Analyze the image, identify the lines and their relationships, and decide how to distribute the graph\'s nodes along the identified lines. Carefully think and strictly apply the following rules, otherwise assignment will be invalid: \n\
      - Consider lines as continuing paths where the last node of a line is also assigned as the first node of the next line. Other than this condition, a node cannot be on two different lines.\n\
      - Try to assign nodes starting from the appropriate node (You do not have to start with the first node in the input graph) and by following adjacencies.\n\
      - Each assigned consecutive nodes must be adjacent in the input graph and all nodes in the input graph musthave an assignment.\n\
      - Do not consider slight changes in the directions since the drawing is made by hand and each line may not be drawn linearly.\n\
      - You can generate as many line segments as required. For the curved drawings, try to approximate the curved line by using multiple shorter straight lines.\n\
      - Consider that x axis increases from left to right and y axis increases from top to bottom. \n\
      Please generate the required assignments of the nodes in the correct order based on their adjacencies in JSON format. For example, for the sample graph: \n' + sampleGraph + ' and a drawing with an Z-shape, the example output should be as follows: { "explanation": detailed reasoning behind the result, "lines": [\n\
          {\n\
              "id": 0,\n\
              "start": [0, 0],\n\
              "end": [10, 0],\n\
              "nodes": ["n0", "n1", "n2"]\n\
          },\n\
          {\n\
              "id": 1,\n\
              "start": [10, 0],\n\
              "end": [0, 10],\n\
              "nodes": ["n2", "n3", "n4", "n5"]\n\
          }\n\
          {\n\
              "id": 1,\n\
              "start": [0, 10],\n\
              "end": [10, 10],\n\
              "nodes": ["n5", "n6", "n7"]\n\
          }\n\
      ],\n\ See that first line ends and second line starts with n2 and second line ends and third line starts with n5 to achieve continuity. See also all consecutive nodes are adjacent in the input graph. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time, check if your answer obeys the rules defined above and produce your final answer carefully!' },
      {
        type: 'image_url', image_url: { "url": image }
      }
    ]
  };

  let messagesArray = [];
  messagesArray.push(systemPrompt);
/*   messagesArray.push(prompts[0]);
  messagesArray.push(prompts[1]);
  messagesArray.push(prompts[17]);
  messagesArray.push(prompts[18]); */
  messagesArray.push(userPrompt);
  let messagesArray2 = [
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
                { type: 'text', text: 'The user has drawn a shape in this image to guide the layout of a graph. Analyze the image, identify the lines and their relationships, and decide: 1. The layout structure (e.g., L-shape, grid, etc.). 2. How to distribute the graph\'s nodes along the identified lines. 3. Generate alignment and relative placement constraints for the graph. \n\
                  Rules:\n\
                  1. **Preserve Line Orientation**:\n\
                     - Horizontal lines should align nodes horizontally.\n\
                     - Vertical lines should align nodes vertically.\n\
                     - Diagonal lines should align nodes along the diagonal direction (not reinterpreted as vertical or horizontal and they should be achieved via relative placement constraints).\n\
                     - If the drawing is curved or irregular, create constraints that distribute nodes along the drawn line as closely as possible.\n\
                  2. **Distribute Nodes Along Lines**:\n\
                     - Assign nodes proportionally based on line lengths.\n\
                     - Ensure all graph nodes are placed on the appropriate lines.\n\
                  3. **Generate Alignment and Placement Constraints**:\n\
                     - Alignment constraints should reflect the line\'s orientation (if it is vertical or horizontal)\n\
                     - Use relative placement constraints to maintain proper positioning of nodes.\n\
                  4. **Constraints**:\n\
                     - `alignmentConstraint`: Only supports "horizontal" and "vertical" alignments and are based on the orientation of the line.\n\
                     - `relativePlacementConstraint`: Only supports left-right e.g. {"left": "n3", "right": "n4"} and top-down e.g. {"top": "n0", "bottom": "n1"} relations and are based on relationships between nodes for proper positioning. You do not have to use both constraint types, use them when needed. \n\
                Example Input: \n\
                Graph: "n0 n1\nn1 n2\nn2 n3\nn3 n4\nn4 n5\nn5 n6"\n\
                User Drawing: Looks like L shape \n\
                Example Output: \n\
                {\n\
                  "explanation": "The image shows an L-shaped layout consisting of a vertical line connected to a horizontal line.",\n\
                  "alignmentConstraint": {\n\
                    "vertical": [["n0", "n1", "n2", "n3"]],\n\
                    "horizontal": [["n3", "n4", "n5", "n6"]]\n\
                  },\n\
                  "relativePlacementConstraint": [\n\
                    {"top": "n0", "bottom": "n1"}\n\
                    {"top": "n1", "bottom": "n2"}\n\
                    {"top": "n2", "bottom": "n3"}\n\
                    {"left": "n3", "right": "n4"}\n\
                    {"left": "n4", "right": "n5"}\n\
                    {"left": "n5", "right": "n6"}\n\
                  ]\n\
                }\n\
                Your task:\n\
                Graph Information: ' + graph + '. Output constraints in the same JSON format as the example above. Follow the reasoning and rules closely.}'},
                {
                  type: 'image_url', image_url: { "url": image }
                }
              ]
            } */
/*               {
                role: "user",
                content: [
                  { type: 'text', text: 'I have the following graph: \n' + graph + '. I have drawn a shape in the given image to guide the layout of the graph. I want my graph to have a layout where the nodes positioned like the overall shape in this image. Analyze the image, identify the lines and their relationships, and decide how to distribute the graph\'s nodes along the identified lines. While identfying lines try to be consistent with the given image. Also, do not consider slight changes in the directions since the drawing is made by hand and each line may not be drawn linearly. Please generate the required placements of the nodes in the correct placement order in JSON format as in the following example output: { "explanation": detailed reasoning behind the result, "lines": [\n\
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
                          "nodes": ["n2", "n3", "n4", "n5"]\n\
                      }\n\
                      {\n\
                          "id": 2,\n\
                          "start": [x3, y3],\n\
                          "end": [x4, y4],\n\
                          "nodes": ["n5", "n6", "n7"]\n\
                      }\n\
                      {\n\
                          "id": 3,\n\
                          "start": [x4, y4],\n\
                          "end": [x5, y5],\n\
                          "nodes": ["n7", "n8", "n9"]\n\
                      }\n\
                  ],\n\: where x1, y1, x2, y2. etc. are real coordinates. Make sure that the last node of a line is also the first node of the next line (THIS IS IMPORTANT). Also make sure that you assign each node to a line. You can generate as many line segments as required. Consider that x axis increases from left to right and y axis increases from top to bottom. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!' },
                  {
                    type: 'image_url', image_url: { "url": image }
                  }
                ]
              } */
/*                 {
                  role: "user",
                  content: [
                    { type: 'text', text: 'I have the following graph: \n' + graph + '. I have drawn a shape in the given image to guide the layout of the graph.' +
                      'The goal is to arrange the graph\'s nodes to match the overall structure of this shape. Analyze the image, identify the primary lines and their relationships, ' + 
                      'and determine how to distribute the graph nodes along these lines. \n\n\
                      - Identify all line segments in the shape, ensuring their directions and relative positions are strictly followed.\n\
                      - Slight variations in direction due to hand-drawing should be ignored. \n\
                      - Nodes should be assigned sequentially to line segments. \n\
                      - The last node of a line must be the first node of the next line (THIS IS IMPORTANT). \n\
                      - You can create as many line segments as needed to match the shape. \n\
                      - The x-axis increases from left to right, and the y-axis increases from top to bottom. \n\n\
                    Please provide the output strictly in the following JSON format:\n\n\
                    ```json\n\
                    {\n\
                      "explanation": detailed reasoning behind the result, \n\
                      "lines": [\n\
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
                            "nodes": ["n2", "n3", "n4", "n5"]\n\
                        }\n\
                        {\n\
                            "id": 2,\n\
                            "start": [x3, y3],\n\
                            "end": [x4, y4],\n\
                            "nodes": ["n5", "n6", "n7"]\n\
                        }\n\
                        {\n\
                            "id": 3,\n\
                            "start": [x4, y4],\n\
                            "end": [x5, y5],\n\
                            "nodes": ["n7", "n8", "n9"]\n\
                        }\n\
                    ],\n\
                    ```\n\n\
                  Ensure that each node is assigned to a line and that the JSON is properly formatted. Please DO NOT include any explanations outside of the JSON response (THIS IS IMPORTANT). Take your time and generate the answer carefully!' 
                  },
                    {
                      type: 'image_url', image_url: { "url": image }
                    }
                  ]
                } */
  ];
  return messagesArray;
};

export { port, app }