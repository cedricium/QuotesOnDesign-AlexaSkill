var request = require('request');
  
exports.handler = (event, context) => {
  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION");
    }

    switch (event.request.type) {
      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`);
        
        var launchText = "Welcome to Quotes on Design. To begin, ask for a new quote.";
        context.succeed(
          generateResponse(
            buildSpeechletResponse(launchText, false),
            {}
          )
        );
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`);
        
        if (event.request.intent.name === "GetQuoteOnDesign") {
          request('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1', function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var parsedBody = JSON.parse(body);
              var dirtyQuote = parsedBody[0].content;
              var author = parsedBody[0].title;

              var cleanQuote = dirtyQuote.substring(3, dirtyQuote.length - 5);
              console.log(cleanQuote);

              context.succeed(
                  generateResponse(
                      buildSpeechletResponse(`${cleanQuote}, . . . ${author}.`, true),
                      {}
                  )
              );
            }
          });
        }
        else
            throw "Invalid intent";
        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);
    }

  } catch(error) { context.fail(`Exception: ${error}`); }

}

buildSpeechletResponse = (outputText, shouldEndSession) => {
  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }
}

generateResponse = (speechletResponse, sessionAttributes) => {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
}