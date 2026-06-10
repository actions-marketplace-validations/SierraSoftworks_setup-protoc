import * as os from "os";
import * as path from "path";
import * as semver from "semver";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { HttpClient } from "@actions/http-client";

const osPlat: string = os.platform();
const osArch: string = os.arch();

// This regex is slightly modified from https://semver.org/ to allow only MINOR.PATCH notation.
const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;

interface IProtocRelease {
  tag_name: string;
  prerelease: boolean;
}

export async function getProtoc(
  version: string,
  includePreReleases: boolean,
  repoToken: string,
) {
  // resolve the version number
  const targetVersion = await computeVersion(
    version,
    includePreReleases,
    repoToken,
  );
  if (targetVersion) {
    version = targetVersion;
  }
  core.info(`Getting protoc version: ${version}`);

  // look if the binary is cached
  let toolPath = tc.find("protoc", version);

  // if not: download, extract and cache
  if (!toolPath) {
    toolPath = await downloadRelease(version);
    core.info(`Protoc cached under ${toolPath}`);
  }

  // expose outputs
  core.setOutput("path", toolPath);
  core.setOutput("version", targetVersion);

  // add the bin folder to the PATH
  core.addPath(path.join(toolPath, "bin"));
}

async function downloadRelease(version: string): Promise<string> {
  // Download
  const fileName: string = getFileName(version, osPlat, osArch);
  const downloadUrl = `https://github.com/protocolbuffers/protobuf/releases/download/${version}/${fileName}`;
  core.info(`Downloading archive: ${downloadUrl}`);

  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (err) {
    if (err instanceof tc.HTTPError) {
      core.debug(err.message);
      throw new Error(
        `Failed to download version ${version}: ${err.name}, ${err.message} - ${err.httpStatusCode}`,
      );
    }
    throw new Error(
      `Failed to download version ${version}: ${err instanceof Error ? err.message : err}`,
    );
  }

  // Extract
  const extPath: string = await tc.extractZip(downloadPath);

  // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
  return tc.cacheDir(extPath, "protoc", version);
}

/**
 *
 * @param osArc - A string identifying operating system CPU architecture for which the Node.js binary was compiled.
 * See https://nodejs.org/api/os.html#osarch for possible values.
 * @returns Suffix for the protoc filename.
 */
function fileNameSuffix(osArc: string): string {
  switch (osArc) {
    case "x64": {
      return "x86_64";
    }
    case "arm64": {
      return "aarch_64";
    }
    case "s390x": {
      return "s390_64";
    }
    case "ppc64": {
      return "ppcle_64";
    }
    default: {
      return "x86_32";
    }
  }
}

/**
 * Returns the filename of the protobuf compiler.
 *
 * @param version - The version to download
 * @param osPlatf - The operating system platform for which the Node.js binary was compiled.
 * See https://nodejs.org/api/os.html#osplatform for more.
 * @param osArc - The operating system CPU architecture for which the Node.js binary was compiled.
 * See https://nodejs.org/api/os.html#osarch for more.
 * @returns The filename of the protocol buffer for the given release, platform and architecture.
 *
 */
export function getFileName(
  version: string,
  osPlatf: string,
  osArc: string,
): string {
  // to compose the file name, strip the leading `v` char
  if (version.startsWith("v")) {
    version = version.slice(1, version.length);
  }
  // in case is a rc release we add the `-`
  if (version.includes("rc")) {
    version = version.replace("rc", "rc-");
  }

  // The name of the Windows package has a different naming pattern
  if (osPlatf == "win32") {
    const arch: string = osArc == "x64" ? "64" : "32";
    return `protoc-${version}-win${arch}.zip`;
  }

  const suffix = fileNameSuffix(osArc);

  if (osPlatf == "darwin") {
    return `protoc-${version}-osx-${suffix}.zip`;
  }

  return `protoc-${version}-linux-${suffix}.zip`;
}

// Retrieve a list of versions scraping tags from the Github API
async function fetchVersions(
  includePreReleases: boolean,
  repoToken: string,
): Promise<string[]> {
  const http = new HttpClient(
    "setup-protoc",
    [],
    repoToken ? { headers: { Authorization: `Bearer ${repoToken}` } } : {},
  );

  let tags: IProtocRelease[] = [];
  for (let pageNum = 1, morePages = true; morePages; pageNum++) {
    const response = await http.getJson<IProtocRelease[]>(
      `https://api.github.com/repos/protocolbuffers/protobuf/releases?page=${pageNum}`,
    );
    const nextPage: IProtocRelease[] = response.result || [];
    if (nextPage.length > 0) {
      tags = tags.concat(nextPage);
    } else {
      morePages = false;
    }
  }

  return tags
    .filter((tag) => tag.tag_name.match(/v\d+\.[\w.]+/g))
    .filter((tag) => includePreReleases || !tag.prerelease)
    .map((tag) => tag.tag_name.replace("v", ""));
}

// Compute an actual version starting from the `version` configuration param.
async function computeVersion(
  version: string,
  includePreReleases: boolean,
  repoToken: string,
): Promise<string> {
  // strip leading `v` char (will be re-added later)
  if (version.startsWith("v")) {
    version = version.slice(1, version.length);
  }

  // strip trailing .x chars
  if (version.endsWith(".x")) {
    version = version.slice(0, version.length - 2);
  }

  const allVersions = await fetchVersions(includePreReleases, repoToken);
  const validVersions = allVersions.filter((v) => v.match(semverRegex));
  const possibleVersions = validVersions.filter((v) => v.startsWith(version));

  const versionMap = new Map();
  possibleVersions.forEach((v) => versionMap.set(normalizeVersion(v), v));

  const versions = Array.from(versionMap.keys())
    .sort(semver.rcompare)
    .map((v) => versionMap.get(v));

  core.debug(`evaluating ${versions.length} versions`);

  if (versions.length === 0) {
    throw new Error("unable to get latest version");
  }

  core.debug(`matched: ${versions[0]}`);

  return "v" + versions[0];
}

// Make partial versions semver compliant.
function normalizeVersion(version: string): string {
  const preStrings = ["rc"];

  const versionPart = version.split(".");
  // drop invalid
  if (versionPart[1] == null) {
    //append minor and patch version if not available
    // e.g. 23 -> 23.0.0
    return version.concat(".0.0");
  } else {
    // handle beta and rc
    // e.g. 23.0-rc1 -> 23.0.0-rc1
    if (preStrings.some((el) => versionPart[1].includes(el))) {
      versionPart[1] = versionPart[1].replace("-rc", ".0-rc");
      return versionPart.join(".");
    }
  }

  if (versionPart[2] == null) {
    //append patch version if not available
    // e.g. 23.1 -> 23.1.0
    return version.concat(".0");
  }

  return version;
}
