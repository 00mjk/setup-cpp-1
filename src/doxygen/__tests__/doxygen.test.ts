import { setupDoxygen } from "../doxygen"
import { cleanupTmpDir, setupTmpDir, testBin } from "../../utils/tests/test-helpers"
import { InstallationInfo } from "../../utils/setup/setupBin"
import { getVersion } from "../../default_versions"
import which from "which"

jest.setTimeout(300000)
describe("setup-doxygen", () => {
  let directory: string
  beforeAll(async () => {
    directory = await setupTmpDir("doxygen")
  })

  it("should setup doxygen and dot", async () => {
    const installInfo = await setupDoxygen(getVersion("doxygen", undefined), directory, process.arch)

    await testBin("doxygen", ["--version"], (installInfo as InstallationInfo | undefined)?.binDir)

    expect(which.sync("dot")).toBeDefined()
  })

  afterAll(async () => {
    await cleanupTmpDir("doxygen")
  }, 100000)
})
