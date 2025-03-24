import OpenAI from 'openai';

let runLLM = async function (graph, description, image) {
    const openai = new OpenAI({
      apiKey: "OPENAI_KEY",
      dangerouslyAllowBrowser: true
    });

  let messagesArray = generateMessage(graph, description, image);
  console.log(messagesArray);

  async function main() {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messagesArray
    });
    let answer = response.choices[0]["message"]["content"];
    answer = answer.replaceAll('```json', '');
    answer = answer.replaceAll('```', '');
    console.log(answer);
    return answer;
  }
  return main();
};

export { runLLM };

/* content: [
  { type: 'text', text: 'I have the following graph: ' + graph + '. I am using a graph layout algorithm that uses relative placement constraints and alignment constraints to position desired nodes accordingly. It accepts the constraints in the following format: relativePlacementConstraint: [{top: "n1", bottom: "n2"}, {left: "n3", right: "n4"}] where n1, n2, etc. are node ids and means that n1 should be placed on top of n2 and n3 should be placed on left of n4. It accepts alignment constraints in the following format: alignmentConstraint: {vertical: [["n1", "n2", "n3"], ["n4", "n5"]], horizontal: [["n2", "n4"]]} where vertical and horizontal alignments are grouped separately. I want my graph to have a layout where the nodes positioned like the given image. By carefully checking the direction of the lines in the image, can you please generate required constraints for the algorithm in JSON format: { "explanation": reasoning behind the result, "relativePlacementConstraint": array of constraints in JSON format as mentioned, "alignmentConstraint": object of constraints in JSON format as mentioned }. You do not have to use both constraint types, use them when needed. Consider that x axis increases from left to right and y axis increases from top to bottom. So if a node should be placed on top of another node, it means that its y value is smaller. Please DO NOT add any other explanations.' },
  {
    type: 'image_url', image_url: { "url": image }
  }
] */



/*   {
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

/*     content: [
      { type: 'text', text: 'The user has drawn a shape in this image to guide the layout of a graph. Analyze the image, identify the lines and their relationships, and decide: 1. The layout structure (e.g., L-shape, grid, etc.). 2. How to distribute the graph\'s nodes along the identified lines. 3. Generate relative positioning for the nodes in the graph. Relative positioning can be one of the following: above, below, left, right, aboveLeft, aboveRight, belowLeft and belowRight. For example ["n0", "above", "n1", "below"] means that n0 should be above and n1 should be below relatively. ["n1", "belowLeft", "n2", "aboveRight"] means n1 should be belowLeft and n2 should be aboveRight relatively. Consider that x axis increases from left to right and y axis increases from top to bottom. So if a node should be placed on top of another node, it means that its y value is smaller.\n\
      Example Input: \n\
      Graph: "n0 n1\nn1 n2\nn2 n3\nn3 n4\nn4 n5\nn5 n6"\n\
      User Drawing: Looks like L shape \n\
      Example Output: \n\
      {\n\
        "explanation": "The image shows an L-shaped layout consisting of a vertical line connected to a horizontal line.",\n\
        "positioning": [\n\
          ["n0", "above", "n1", "below"]\n\
          ["n1", "above", "n2", "below"]\n\
          ["n2", "above", "n3", "below"]\n\
          ["n3", "left", "n4", "right"]\n\
          ["n4", "left", "n5", "right"]\n\
          ["n5", "left", "n6", "right"]\n\
        ]\n\
      }\n\
      Your task:\n\
      Graph Information: ' + graph + '. Output constraints in the same JSON format as the example above. Follow the reasoning and rules closely.}'
      },
      {
        type: 'image_url', image_url: { "url": image }
      }
    ] */

// structred input test

/*       content: [
        { type: 'text', text: 'I have the following graph: \n' + graph + '. I am using a graph layout algorithm that uses relative placement constraints and alignment constraints to position desired nodes accordingly. I want my graph to have a layout where the nodes positioned like the overall shape described here: { \n\
        "lines": [\n\
            {\n\
                "id": 0,\n\
                "start": [0, 0],\n\
                "end": [0, 100],\n\
            },\n\
            {\n\
                "id": 1,\n\
                "start": [0, 100],\n\
                "end": [100, 100],\n\
            }\n\
            {\n\
                "id": 2,\n\
                "start": [100, 100],\n\
                "end": [100, 0],\n\
            }\n\
            {\n\
                "id": 2,\n\
                "start": [100, ],\n\
                "end": [0, 0],\n\
            }\n\
        ],\n\
    } \n\
By carefully checking the lines and considering to placing nodes over those lines, can you please generate required constraints for the algorithm in JSON format: { "explanation": reasoning behind the result, "placement": "which nodes should be placed which lines and in what order"}. Consider that x axis increases from left to right and y axis increases from top to bottom. So if a node should be placed on top of another node, it means that its y value is smaller. Please DO NOT add any other explanations. Take your time and produce constraints carefully!' },
        {
          type: 'image_url', image_url: { "url": image }
        }
      ] */

    // final

/*     content: [
      { type: 'text', text: 'I have the following graph: \n' + graph + '. I am using a graph layout algorithm that uses relative placement constraints and alignment constraints to position desired nodes accordingly. It accepts the constraints in the following format: relativePlacementConstraint: [{top: "n1", bottom: "n2"}, {left: "n3", right: "n4"}] where n1, n2, etc. are node ids and means that n1 should be placed on top of n2 and n3 should be placed on left of n4. It accepts alignment constraints in the following format: alignmentConstraint: {vertical: [["n1", "n2", "n3"], ["n4", "n5"]], horizontal: [["n2", "n4"]]} where vertical and horizontal alignments are grouped separately. I want my graph to have a layout where the nodes positioned like the overall shape in the given image. By carefully checking the lines in the image and considering to placing nodes over those lines, can you please generate required constraints for the algorithm in JSON format: { "explanation": reasoning behind the result, "relativePlacementConstraint": array of constraints in JSON format as mentioned, "alignmentConstraint": object of constraints in JSON format as mentioned }. You do not have to use both constraint types, use them when needed. Consider that x axis increases from left to right and y axis increases from top to bottom. So if a node should be placed on top of another node, it means that its y value is smaller. Please DO NOT add any other explanations. Take your time and produce constraints carefully!' },
      {
        type: 'image_url', image_url: { "url": image }
      }
    ] */



// turn to this -- this is most tried prompt

/* let userPrompt = {
  role: "user",
  content: [
    { type: 'text', text: 'I have the following graph: \n' + graph + '. I have drawn a shape in the given image and I want my graph to have a layout where the nodes positioned like the overall shape in this image. Analyze the image, identify the lines and their relationships, and decide how to distribute the graph\'s nodes along the identified lines. While identfying lines try to be consistent with the given image. Also, do not consider slight changes in the directions since the drawing is made by hand and each line may not be drawn linearly. Please generate the required assignments of the nodes in the correct order based on their adjacencies in JSON format as in the following example output: { "explanation": detailed reasoning behind the result, "lines": [\n\
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
    ],\n\: where x1, y1, x2, y2. etc. are real coordinates. Make sure that the last node of a line is also the first node of the next line (THIS IS IMPORTANT). Other than this condition, a node cannot be on two different lines. You can generate as many line segments as required. For the curved drawings, try to approximate it by using multiple lines Consider that x axis increases from left to right and y axis increases from top to bottom. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!' },
    {
      type: 'image_url', image_url: { "url": image }
    }
  ]
}; */

/* let userPrompt = {
  role: "user",
  content: [
    { type: 'text', text: 'I have the following undirected graph: \n' + graph + '. I have drawn a shape in the given image and I want my graph to have a layout where the nodes positioned like the overall shape in this image. In other words, the layout of the graph\'s nodes should follow the shape represented in the provided image as a single continuous path. This path should be made up of connected straight lines approximating the overall drawing, with each line connecting to the next at one shared node, meaning: - Each line segment must start where the previous one ends, forming one continuous sequence. - Each node should appear only once in the entire layout, except where it serves as the connecting point between two adjacent lines. - The path must follow valid adjacencies from the input graph, each node on the path must be connected to the next. - Approximate curves or angles in the image using multiple connected straight lines if necessary. Please generate your answer in JSON format as in the following example output: { "explanation": detailed reasoning behind the result, "lines": [\n\
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
            "nodes": ["n2", "n3", "n4"]\n\
        }\n\
        {\n\
            "id": 2,\n\
            "start": [x3, y3],\n\
            "end": [x4, y4],\n\
            "nodes": ["n4", "n5", "n6"]\n\
        }\n\
        {\n\
            "id": 3,\n\
            "start": [x4, y4],\n\
            "end": [x5, y5],\n\
            "nodes": ["n6", "n7"]\n\
        }\n\
    ],\n\: where x1, y1, x2, y2. etc. are real coordinates and there is the following adjacency among nodes: n1-n2-n3-n4-n5-n6-n7. The final layout should match the overall shape as closely as possible while preserving the graph\'s adjacency structure and following the above constraints. Consider that x axis increases from left to right and y axis increases from top to bottom. Please DO NOT add any other explanations than the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!' },
    {
      type: 'image_url', image_url: { "url": image }
    }
  ]
}; */

/* let userPrompt = {
  role: "user",
  content: [
    { type: 'text', text: 'Given the following undirected graph: \n' + graph + ' and the uploaded image, I want the graph\'s layout to match the overall shape shown in the image. Your task is to: 1- Analyze the image and identify the major lines that form the shape. If there are curves, approximate them with multiple connected straight lines. Slight imperfections in the drawing (like non-straightness) should be ignored — focus on the overall form. 2- Distribute the graph\'s nodes along these lines in a way that: - Reflects the structure of the shape. - Preserves graph adjacencies, two nodes placed consecutively must be connected in the graph. 3- Output the result in the following JSON format: \n\
      { "explanation": detailed reasoning behind the result, \n\
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
            "nodes": ["n2", "n3", "n4"]\n\
        }\n\
        {\n\
            "id": 2,\n\
            "start": [x3, y3],\n\
            "end": [x4, y4],\n\
            "nodes": ["n4", "n5", "n6"]\n\
        }\n\
        {\n\
            "id": 3,\n\
            "start": [x4, y4],\n\
            "end": [x5, y5],\n\
            "nodes": ["n6", "n7"]\n\
        }\n\
    ],\n\ where x1, y1, x2, y2. etc. are coordinates and there is the following adjacency among nodes: n1-n2-n3-n4-n5-n6-n7. \n\
    Important Structural Rules (apply strictly):\n\
    - The output layout must form one continuous, non-branching path that follows the overall shape shown in the image (e.g., an L, U, zigzag, etc.).\n\
    - Each line must start with the last node of the previous line, forming a sequence.\n\
    - No node can appear in more than one line, except as the shared endpoint between two connected lines.\n\
    - The nodes must respect the actual graph connections: any two adjacent nodes in the nodes array of a line must be adjacent in the graph (THIS IS IMPORTANT, strictly apply).\n\
    - You can generate as many line segments as needed to approximate the shape.\n\
    - Assume the coordinate system has x increasing from left to right and y increasing from top to bottom.\n\
    - Please DO NOT add any other explanations outside the JSON format (THIS IS IMPORTANT). Take your time and produce answer carefully!' },
    {
      type: 'image_url', image_url: { "url": image }
    }
  ]
}; */

/* let userPrompt = {
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
}; */