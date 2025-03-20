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