# SinkFinder

SinkFinder scans a target URL for user controlled input verctors and 
probes them with a set different payloads to identify
potential sinks. 

It uses puppeteer to communicate with the target and to evaluate 
the identifiers which are reflected into the dom.

**Development**

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/thomashartm/sinkfinder.git
# Go into the repository
cd sinkfinder
# Install dependencies
npm install
# Run the app
npm start
```

## License


