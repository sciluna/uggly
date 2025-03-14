import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const convertImage = (imgPath) => {
  // read image file
  let data = fs.readFileSync(imgPath);

  // convert image file to base64-encoded string
  const base64Image = Buffer.from(data, 'binary').toString('base64');

  // combine all strings
  const base64ImageStr = `data:image/png;base64,${base64Image}`;
  return base64ImageStr;
};

let sampleGraph = `n0 n1\nn1 n2\nn2 n3\nn3 n4\nn4 n5\nn5 n6\nn6 n7`;

let userComment = 'I have the following graph: \n' + sampleGraph + '. I have drawn a shape in the given image to guide the layout of the graph. I want my graph to have a layout where the nodes positioned like the overall shape in this image. Analyze the image, identify the lines and their relationships, and decide how to distribute the graph\'s nodes along the identified lines. While identfying lines try to be consistent with the given image. Also, do not consider slight changes in the directions since the drawing is made by hand and each line may not be drawn linearly. Please generate the required assignments of the nodes in the correct order based on their adjacency in JSON format as in the following example output: { "explanation": detailed reasoning behind the result, \n\
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
],\n\: where x1, y1, x2, y2. etc. are real coordinates. Make sure that the last node of a line is also the first node of the next line (THIS IS IMPORTANT). Also make sure that you assign each node to a line. You can generate as many line segments as required. Consider that x axis increases from left to right and y axis increases from top to bottom. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!';

let horizontalLineResult =
{
  "explanation": "The shape consists of a single horizontal line. Nodes are evenly distributed along it.",
  "lines": [
    { "id": 0, "start": [0, 0], "end": [4, 0], "nodes": ["n0", "n1", "n2", "n3", "n4", "n5", "n6", "n7"] }
  ]
};

let verticalLineResult =
{
  "explanation": "The shape consists of a single vertical line. Nodes are evenly distributed from top to bottom.",
  "lines": [
    { "id": 0, "start": [0, 0], "end": [0, 5], "nodes": ["n0", "n1", "n2", "n3", "n4", "n5", "n6", "n7"] }
  ]
};

let lShapeResult =
{
  "explanation": "The shape is similar to an L-shape consists of a vertical line followed by a horizontal line towards right. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [0, 0], "end": [0, 5], "nodes": ["n0", "n1", "n2", "n3", "n4"] },
    { "id": 1, "start": [0, 5], "end": [3, 5], "nodes": ["n4", "n5", "n6", "n7"] }
  ]
};

let reverseLShapeResult =
{
  "explanation": "The shape is similar to a mirrored L-shape consists of a vertical line followed by a horizontal line towards left. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [3, 0], "end": [3, 5], "nodes": ["n0", "n1", "n2", "n3", "n4"] },
    { "id": 1, "start": [3, 5], "end": [0, 5], "nodes": ["n4", "n5", "n6", "n7"] }
  ]
};

let zShapeResult =
{
  "explanation": "The shape is similar to a Z-shape consists of three main segments: a horizontal line, a diagonal line, and another horizontal line. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [0, 0], "end": [3, 0], "nodes": ["n0", "n1", "n2"] },
    { "id": 1, "start": [3, 0], "end": [0, 4], "nodes": ["n2", "n3", "n4", "n5"] },
    { "id": 2, "start": [0, 4], "end": [3, 4], "nodes": ["n5", "n6", "n7"] }
  ]
};

let reverseZShapeResult =
{
  "explanation": "The shape is similar to a mirrored Z-shape consists of three main segments: a horizontal line, a diagonal line, and another horizontal line. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [3, 0], "end": [0, 0], "nodes": ["n0", "n1", "n2"] },
    { "id": 1, "start": [0, 0], "end": [3, 4], "nodes": ["n2", "n3", "n4", "n5"] },
    { "id": 2, "start": [3, 4], "end": [0, 4], "nodes": ["n5", "n6", "n7"] }
  ]
};

let diagonalResult =
{
  "explanation": "The shape consists of a single diagonal line from top-left to bottom-right. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [0, 0], "end": [4, 4], "nodes": ["n0", "n1", "n2", "n3", "n4", "n5", "n6", "n7"] }
  ]
};

let reverseDiagonalResult =
{
  "explanation": "The shape consists of a single diagonal line from top-right to bottom-left. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [4, 0], "end": [0, 4], "nodes": ["n0", "n1", "n2", "n3", "n4", "n5", "n6", "n7"] }
  ]
};

let rectangleResult =
{
  "explanation": "The shape is a rectangle with four connected edges forming a closed loop. Nodes are assigned accordingly.",
  "lines": [
    { "id": 0, "start": [0, 0], "end": [4, 0], "nodes": ["n0", "n1", "n2"] },
    { "id": 1, "start": [4, 0], "end": [4, 3], "nodes": ["n2", "n3", "n4"] },
    { "id": 2, "start": [4, 3], "end": [0, 3], "nodes": ["n4", "n5", "n6"] },
    { "id": 3, "start": [0, 3], "end": [0, 0], "nodes": ["n5", "n6", "n7"] }
  ]
};

let circleResult =
{
  "explanation": "The shape forms a closed circular loop. Nodes are evenly distributed along the perimeter, maintaining adjacency.",
  "lines": [
    { "id": 0, "start": [3, 0], "end": [5, 1], "nodes": ["n0", "n1"] },
    { "id": 1, "start": [5, 1], "end": [6, 3], "nodes": ["n1", "n2"] },
    { "id": 2, "start": [6, 3], "end": [5, 5], "nodes": ["n2", "n3"] },
    { "id": 3, "start": [5, 5], "end": [3, 6], "nodes": ["n3", "n4"] },
    { "id": 4, "start": [3, 6], "end": [1, 5], "nodes": ["n4", "n5"] },
    { "id": 5, "start": [1, 5], "end": [0, 3], "nodes": ["n5", "n6"] },
    { "id": 6, "start": [0, 3], "end": [1, 1], "nodes": ["n6", "n7"] },
    { "id": 6, "start": [1, 1], "end": [3, 0], "nodes": ["n7", "n8"] }
  ]
};

let prompts = [
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "horizontal-line.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(horizontalLineResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "vertical-line.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(verticalLineResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "L-shape.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(lShapeResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "reverse-L-shape.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(reverseLShapeResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "Z-shape.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(zShapeResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "reverse-Z-shape.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(reverseZShapeResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "diagonal.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(diagonalResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "reverse-diagonal.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(reverseDiagonalResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "rectangle.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(rectangleResult)
  },
  {
    role: "user",
    content: [
      { type: 'text', text: userComment },
      {
        type: 'image_url', image_url: { "url": convertImage(path.join(__dirname, "circle.png")) }
      }
    ]
  },
  {
    role: "assistant",
    content: JSON.stringify(circleResult)
  }
];

export { prompts };