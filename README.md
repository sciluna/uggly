# UGGLY

**U**ser-**G**uided **G**raph **L**a**Y**out (UGGLY) is a user-guided, force-directed layout approach that allows users to specify their desired layout structure by drawing shapes (e.g., rectangle, L-shape). UGGLY combines the shape-interpretation capabilities of multimodal large language models (mLLMs) with the quality of force-directed layouts that support placement constraints, producing visually effective layouts aligned with user intent. It is implemented using the Cytoscape.js library by [Luna Lab](https://github.com/sciluna).

## Usage instructions
In order to deploy and run a local instance, please follow the steps below:
```
git clone https://github.com/sciluna/uggly.git
cd uggly
npm install
```
Inside `uggly` folder, create a .env file and insert OpenAI API Key and/or Gemini API Key:
```
OPENAI_API_KEY=<YOUR-OPENAI-API-KEY>
GEMINI_API_KEY=<YOUR-GEMINI-API-KEY>
```
Start the application:
```
npm start
```
The default port is 8080, you can change it by setting 'PORT' environment variable.

**Note:** We recommend the use of Node.js version 20.x and npm version 10.x. We used Node.js v20.14.0 and npm v10.7.0 during development.

### Docker
Alternatively, you can use Dockerfile provided in the root directory. To run the Dockerfile (below commands may require *sudo* in Linux environment):

First, `cd` into the folder where Dockerfile is located.

Then, build a Docker image with name *uggly* (this may take a while).
```
docker build -t uggly .
```
Lastly, run the image from port 8080. If you want to use another port, please change the first port number in below command.
```
docker run -e OPENAI_API_KEY=<YOUR-OPENAI-API-KEY> -e GEMINI_API_KEY=<YOUR-GEMINI-API-KEY> -p 8080:8080 uggly
```
