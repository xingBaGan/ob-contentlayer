/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
import { ProbotOctokit } from "probot";

async function createRepo(context, app, repoName = "My-Obsidian-Notes") {
  // Check if the app has the necessary permissions
  const { installation } = context.payload;
  if (!installation) {
    app.log.error("No installation context found.");
    return;
  }
  const token = await context.octokit.apps.createInstallationAccessToken({
    installation_id: installation.id,
  });
  const octokit = new ProbotOctokit({
    // any options you'd pass to Octokit
    auth: {
      token: token.data.token,
    },
    // and a logger
    log: app.log.child({ name: "my-octokit" }),
  });
  const user = context.repo().owner;
  const { data } = await octokit.rest.repos.createUsingTemplate({
    template_owner: "xingBaGan",
    template_repo: "tailwind-nextjs-starter-blog",
    name: repoName,
    owner: user,
  });
  app.log.info(`created repo: ${data.html_url}`);
}

export default (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!"); 

  app.on("installation.created", async (context) => {
    const {
      payload: { installation },
    } = context;
    app.log.info(`installation created: ${installation.id}`);
  });

  app.on("issues.closed", async (context) => {
    const { 
      payload: { issue },
    } = context;
    app.log.info(`issue closed: ${issue.title}`);
  });

  app.on("issues.opened", async (context) => {
    const { issue } = context.payload;
    if (issue.title.includes("create repo")) {
      const repoName = issue.title.split(":")[1];
      app.log.info(`repo name: ${repoName}`);
      try {
        await createRepo(context, app, repoName);
        await context.octokit.rest.issues.createComment({
          ...context.repo(),
          issue_number: issue.number,
          body: "Repo created successfully!",
        });
      } catch (error) {
        app.log.error(`Failed to create repo: ${error.message}`);
        await context.octokit.rest.issues.createComment({
          ...context.repo(),
          issue_number: issue.number,
          body: `Failed to create repo: ${error.message}`,
        });
      }
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

};
