const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');

async function gitStatus() {
  const { stdout, stderr } = await exec('git status');
  if (stderr) {
    console.error(`Error getting git status: ${stderr}`);
    return null;
  }
  return stdout.trim();
}

async function gitDiff() {
  const { stdout, stderr } = await exec('git diff');
  if (stderr) {
    console.error(`Error getting git diff: ${stderr}`);
    return null;
  }
  return stdout.trim();
}

async function callGptApi(prompt) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      model: "text-davinci-003",
      prompt,
      temperature: 0.3,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].text;
}

async function generateCommitMessage() {
  const gitStatusOutput = await gitStatus();
  const gitDiffOutput = await gitDiff();

  const prompt = `Based on the following git status and git diff, picture yourself as a tech-savvy poet, whose art lies in marrying humor with technical precision. Your task is to craft a clever and mildly amusing commit message that, despite inducing a grin, accurately outlines what you've changed. In this balancing act, let your wit shine, but make sure clarity isn't lost in the fun.

  Git Status:\n${gitStatusOutput}\n\nGit Diff:\n${gitDiffOutput}.
  
  Remember, your cleverness should illuminate the problem you're solving, not obscure it. Have fun`;
  const commitMessage = await callGptApi(prompt);

  console.log(` ${commitMessage}`);
}

generateCommitMessage();
