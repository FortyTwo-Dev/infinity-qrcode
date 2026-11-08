import { beforeEach, describe, expect, test } from 'vitest'
import type { Mock } from 'vitest'

type WasmInit = (_input?: unknown) => Promise<unknown>

/** Import a loader module after resetting its graph, then return its loader. */
type LoaderFactory = () => Promise<() => Promise<void>>

export interface WasmLoaderScenario {
  /** Spy replacing the external package's default init export. */
  readonly init: Mock<WasmInit>
  /** Reset the module graph, import the loader, and expose its entry point. */
  readonly loadLoader: LoaderFactory
}

/**
 * Register the loader contract shared by the generator and learn engines.
 * Every test imports a fresh loader module, so the module-level singleton
 * starts empty and the retry behaviour stays observable.
 */
export function describeWasmLoader(name: string, scenario: WasmLoaderScenario): void {
  describe(name, () => {
    beforeEach(() => {
      scenario.init.mockReset()
      scenario.init.mockImplementation(() => Promise.resolve({}))
    })

    test('shares one pending initialization between concurrent callers', async () => {
      const load = await scenario.loadLoader()

      const first = load()
      const second = load()

      await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined])
      expect(scenario.init).toHaveBeenCalledTimes(1)
    })

    test('keeps a successful initialization cached', async () => {
      const load = await scenario.loadLoader()

      await expect(load()).resolves.toBeUndefined()
      await expect(load()).resolves.toBeUndefined()

      expect(scenario.init).toHaveBeenCalledTimes(1)
    })

    test('runs a new initialization on the next call after a rejected one', async () => {
      scenario.init.mockRejectedValueOnce(new Error('initialization failed'))
      const load = await scenario.loadLoader()

      await expect(load()).rejects.toThrow('initialization failed')
      expect(scenario.init).toHaveBeenCalledTimes(1)

      await expect(load()).resolves.toBeUndefined()

      expect(scenario.init).toHaveBeenCalledTimes(2)
    })

    test('starts a new initialization for every call after repeated failures', async () => {
      scenario.init
        .mockRejectedValueOnce(new Error('first failure'))
        .mockRejectedValueOnce(new Error('second failure'))
      const load = await scenario.loadLoader()

      await expect(load()).rejects.toThrow('first failure')
      await expect(load()).rejects.toThrow('second failure')
      await expect(load()).resolves.toBeUndefined()

      expect(scenario.init).toHaveBeenCalledTimes(3)
    })
  })
}
