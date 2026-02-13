self.onmessage = function (e) {
  const { weight, reps } = e?.data;

  console.log("function called: ", weight, reps);
  if (reps > 10) {
    console.warn("Accuracy decreases significantly above 10 reps");
  }

  if (reps === 1) {
    return {
      brzycki: weight,
      epley: weight,
      lander: weight,
      lombardi: weight,
      average: weight,
      min: weight,
      max: weight,
      range: 0,
      confidence: "very-high",
    };
  }

  const brzycki = weight / (1.0278 - 0.0278 * reps);

  const epley = weight * (1 + reps / 30);

  const lander = (100 * weight) / (101.3 - 2.67123 * reps);

  const lombardi = weight * Math.pow(reps, 0.1);

  const average = (brzycki + epley + lander + lombardi) / 4;

  const results = [brzycki, epley, lander, lombardi];
  const min = Math.min(...results);
  const max = Math.max(...results);
  const range = max - min;

  let confidence;
  const variationPercent = (range / average) * 100;
  if (variationPercent < 2) {
    confidence = "very-high";
  } else if (variationPercent < 5) {
    confidence = "high";
  } else if (variationPercent < 8) {
    confidence = "moderate";
  } else {
    confidence = "low";
  }

  self.postMessage({
    brzycki: Math.round(brzycki * 10) / 10,
    epley: Math.round(epley * 10) / 10,
    lander: Math.round(lander * 10) / 10,
    lombardi: Math.round(lombardi * 10) / 10,
    average: Math.round(average * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    range: Math.round(range * 10) / 10,
    confidence: confidence,
    variationPercent: Math.round(variationPercent * 10) / 10,
  });
};
