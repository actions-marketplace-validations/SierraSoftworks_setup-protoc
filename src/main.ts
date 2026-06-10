import * as core from "@actions/core";
import * as installer from "./installer";

async function run(): Promise<void> {
  try {
    const version = core.getInput("version");
    const includePreReleases = core.getBooleanInput("include-pre-releases");
    const repoToken = core.getInput("repo-token");
    await installer.getProtoc(version, includePreReleases, repoToken);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
