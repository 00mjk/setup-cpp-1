import { extractZip, find, downloadTool, cacheFile } from "@actions/tool-cache"
import { addPath, group, startGroup, endGroup } from "@actions/core"
import { join } from "path"
import { existsSync } from "fs"
import * as hasha from "hasha"
import { tmpdir } from "os"

/** Get the platform name Ninja uses in their download links */
function getNinjaPlatform(platform: NodeJS.Platform) {
  switch (platform) {
    case "win32":
      return "win"
    case "darwin":
      return "mac"
    case "linux":
      return "linux"
    default:
      throw new Error(`Unsupported platform '${platform}'`)
  }
}

export async function setupNinja(version: string): Promise<string> {
  const platform = getNinjaPlatform(process.platform)

  // Build artifact name
  const ninjaBin = platform === "win" ? "ninja.exe" : "ninja"

  // Restore from cache (if found).
  const ninjaDir = find("ninja", version)
  if (ninjaDir) {
    addPath(ninjaDir)
    return join(ninjaDir, ninjaBin)
  }

  const url = `https://github.com/ninja-build/ninja/releases/download/v${version}/ninja-${platform}.zip`

  // Get an unique output directory name from the URL.
  const key: string = await hasha.async(url)
  const outputDir = join(process.env.RUNNER_TEMP ?? tmpdir(), key)

  const ninjaPath = join(outputDir, ninjaBin)

  if (!existsSync(outputDir)) {
    await group("Download and extract ninja-build", async () => {
      const downloaded = await downloadTool(url)
      await extractZip(downloaded, outputDir)
    })
  }

  try {
    startGroup("Add ninja-build to PATH")
    addPath(outputDir)
  } finally {
    endGroup()
  }

  await cacheFile(ninjaPath, ninjaBin, "ninja", version)

  return ninjaPath
}