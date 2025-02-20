import { port, app } from './index.js';

const server = app.listen(port, () => {
	console.log("Listening on " + port);
});