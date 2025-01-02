/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
export default (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");

  app.on("installation.created", async (context) => {
    const repo = context.payload.repository;

    // 创建新仓库的 API 调用
    const newRepo = await context.octokit.repos.createForAuthenticatedUser({
      name: 'new-repo-name',
      description: 'This is a new repository created by Probot',
      private: false
    });

    console.log(`New repository created: ${newRepo.data.html_url}`);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

};
