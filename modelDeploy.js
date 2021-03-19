let model, video, startButton, start, end;
let flightTime = 0;
let jumpHeight = 0;
let poseLabel = "Off";
let state = "LANDING";
let classifyMode = false;

//Load the model first
function preload() {
  model = ml5.imageClassifier("./model/model.json", () => {
    console.log("Model is ready");
  });
}

function setup() {
  let canvas = createCanvas(780, 460);
  canvas.position(130, 100);
  video = createCapture(VIDEO);
  video.hide();

  startButton = createButton("Start");
  startButton.position(130, 600);
  startButton.class("button");
  startButton.mousePressed(classifyPose);

  //classifyPose();
}

function draw() {
  image(video, 0, 0, video.width, video.height);

  fill(255, 0, 255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(poseLabel, width * 0.4, height - 16);
  text("Flight time: " + flightTime, width * 0.7, height - 42);
  text("Jump height: " + jumpHeight, width * 0.7, height - 16);
}

function classifyPose() {
  classifyMode = true;
  resetLabel();
  model.classify(video, gotResults);
}

//Reset the time and height label
function resetLabel() {
  flightTime = 0;
  jumpHeight = 0;
}

//Process the results from classifying
function gotResults(error, results) {
  //Something went wrong
  if (error) {
    console.log(error);
    return;
  }
  //Get the prediction with higher probability
  poseLabel = results[0].label;

  //Change the button text
  startButton.html("Classifying...");

  //Get the start time when the athlete starts jumping, and change the state
  if (state === "LANDING" && poseLabel === "Jump") {
    start = millis();
    state = "JUMPING";
  }
  //When the athelete lands, change the state, classify mode, button text and calculate the flight time & jump height
  if (state === "JUMPING" && poseLabel === "Land") {
    end = millis();
    state = "LANDING";
    flightTime = (end - start) / 1000;
    jumpHeight = Math.floor(Math.pow(flightTime, 2) * 1.22625 * 10000) / 100;
    flightTime += " s";
    jumpHeight += " cm";
    classifyMode = false;
    poseLabel = "DONE!";
    startButton.html("Start again");
  }
  //Continue to classify if the mode is turned on
  if (classifyMode === true) {
    classifyPose();
  }
}
