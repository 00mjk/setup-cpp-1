import * as core from "@actions/core"
import { setupCmake } from "./cmake/cmake"
import { setupConan } from "./conan/conan"
import { setupLLVM } from "./llvm/llvm"
import { setupMeson } from "./meson/meson"
import { setupNinja } from "./ninja/ninja"

function maybeGetInput(key: string) {
  const value = core.getInput(key)
  if (value !== "false" && value !== "") {
    return value
  }
  return undefined
}

export async function main(): Promise<number> {
  const setupCppDir = process.env.SETUP_CPP_DIR ?? "~/setup_cpp"
  try {
    // setup cmake
    const cmakeVersion = maybeGetInput("cmake")
    if (cmakeVersion !== undefined) {
      await setupCmake(cmakeVersion, setupCppDir)
    }

    // setup ninja
    const ninjaVersion = maybeGetInput("ninja")
    if (ninjaVersion !== undefined) {
      await setupNinja(ninjaVersion, setupCppDir)
    }

    // setup conan
    const conanVersion = maybeGetInput("conan")
    if (conanVersion !== undefined) {
      await setupConan(conanVersion)
    }

    // setup meson
    const mesonVersion = maybeGetInput("meson")
    if (mesonVersion !== undefined) {
      await setupMeson(mesonVersion)
    }

    // setup llvm
    const llvmVersion = maybeGetInput("llvm")
    if (llvmVersion !== undefined) {
      await setupLLVM(llvmVersion, setupCppDir)
    }
  } catch (err) {
    core.error(err as string | Error)
    core.setFailed("install-cpp failed")
    return 1
  }

  core.info("install-cpp succeeded")
  return 0
}

main()
  .then((ret) => {
    process.exitCode = ret
  })
  .catch((error) => {
    core.error("main() failed!")
    core.error(error as string | Error)
    process.exitCode = 1
  })
