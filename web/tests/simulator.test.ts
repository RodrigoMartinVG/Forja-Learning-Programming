import { describe, expect, it } from 'vitest'

import { parseSimulatorInput, stepMachine, type SimulatorMachine } from '../src/lib/simulator'

function loadMachine(program: string, data = ''): SimulatorMachine {
  const { issues, machine } = parseSimulatorInput(program, data)

  expect(issues).toEqual([])
  expect(machine).not.toBeNull()

  if (!machine) {
    throw new Error('expected simulator input to parse successfully')
  }

  return machine
}

function runUntilStop(machine: SimulatorMachine, maxSteps = 1000): { machine: SimulatorMachine; steps: number } {
  let working = machine
  let steps = 0

  for (; steps < maxSteps && working.status === 'ready'; steps += 1) {
    working = stepMachine(working, 'instruction')
  }

  if (working.status === 'ready') {
    throw new Error(`expected machine to stop within ${maxSteps} steps`)
  }

  return { machine: working, steps }
}

describe('parseSimulatorInput', () => {
  it('parses indirect addressing and seeds the initial load trace', () => {
    const { issues, machine } = parseSimulatorInput(
      ['0: MOV r5, 40', '1: LOAD r1, [r5]', '2: STORE r1, [41]', '3: HALT'].join('\n'),
      ['40: 7', '41: 0'].join('\n'),
    )

    expect(issues).toEqual([])
    expect(machine).not.toBeNull()

    expect(machine?.pc).toBe(0)
    expect(machine?.executedInstructions).toBe(0)
    expect(machine?.program[1]).toMatchObject({
      kind: 'load',
      dest: 'r1',
      sourceRef: { kind: 'indirect', register: 'r5' },
    })
    expect(machine?.program[2]).toMatchObject({
      kind: 'store',
      source: 'r1',
      targetRef: { kind: 'direct', address: 41 },
    })
    expect(machine?.lastTrace).toMatchObject({
      kind: 'load',
      changes: expect.arrayContaining(['pc = 0', '4 instrucciones cargadas', '2 datos cargados']),
    })
  })

  it('rejects duplicated addresses across program and data', () => {
    const { issues, machine } = parseSimulatorInput('0: HALT', '0: 1')

    expect(machine).toBeNull()
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      scope: 'datos',
      line: 1,
    })
    expect(issues[0]?.message).toContain('la dirección 0 ya fue usada')
  })
})

describe('stepMachine', () => {
  it('executes a full instruction cycle in instruction mode and then halts', () => {
    const machine = loadMachine(['0: MOV r0, 5', '1: HALT'].join('\n'))

    const afterMove = stepMachine(machine, 'instruction')
    expect(afterMove.phase).toBe('execute')
    expect(afterMove.status).toBe('ready')
    expect(afterMove.pc).toBe(1)
    expect(afterMove.executedInstructions).toBe(1)
    expect(afterMove.registers.r0).toBe(5)
    expect(afterMove.lastTrace).toMatchObject({
      kind: 'instruction',
      instructionText: 'MOV r0, 5',
    })
    expect(afterMove.lastTrace?.phases.map((phase) => phase.phase)).toEqual(['fetch', 'decode', 'execute'])

    const afterHalt = stepMachine(afterMove, 'instruction')
    expect(afterHalt.status).toBe('halted')
    expect(afterHalt.phase).toBe('execute')
    expect(afterHalt.executedInstructions).toBe(2)
    expect(afterHalt.lastTrace).toMatchObject({
      kind: 'instruction',
      instructionText: 'HALT',
    })
  })

  it('advances fetch, decode and execute separately in micro mode', () => {
    const machine = loadMachine(['0: MOV r0, 3', '1: HALT'].join('\n'))

    const afterFetch = stepMachine(machine, 'micro')
    expect(afterFetch.phase).toBe('fetch')
    expect(afterFetch.ir).toBe('MOV r0, 3')
    expect(afterFetch.executedInstructions).toBe(0)
    expect(afterFetch.registers.r0).toBe(0)
    expect(afterFetch.lastTrace?.kind).toBe('micro')
    expect(afterFetch.lastTrace?.phases[0]?.phase).toBe('fetch')

    const afterDecode = stepMachine(afterFetch, 'micro')
    expect(afterDecode.phase).toBe('decode')
    expect(afterDecode.executedInstructions).toBe(0)
    expect(afterDecode.registers.r0).toBe(0)
    expect(afterDecode.lastTrace?.phases[0]?.phase).toBe('decode')

    const afterExecute = stepMachine(afterDecode, 'micro')
    expect(afterExecute.phase).toBe('execute')
    expect(afterExecute.pc).toBe(1)
    expect(afterExecute.executedInstructions).toBe(1)
    expect(afterExecute.registers.r0).toBe(3)
    expect(afterExecute.lastTrace?.phases[0]?.phase).toBe('execute')
  })

  it('resolves load/store with register-indirect addressing', () => {
    const machine = loadMachine(
      ['0: MOV r5, 40', '1: LOAD r1, [r5]', '2: STORE r1, [41]', '3: HALT'].join('\n'),
      ['40: 7', '41: 0'].join('\n'),
    )

    const afterMove = stepMachine(machine, 'instruction')
    const afterLoad = stepMachine(afterMove, 'instruction')
    const afterStore = stepMachine(afterLoad, 'instruction')

    expect(afterLoad.registers.r1).toBe(7)
    expect(afterLoad.status).toBe('ready')
    expect(afterLoad.executedInstructions).toBe(2)
    expect(afterStore.data[41]).toBe(7)
    expect(afterStore.status).toBe('ready')
    expect(afterStore.executedInstructions).toBe(3)
  })

  it('uses the extra registers to find the next prime number', () => {
    const machine = loadMachine(
      [
        '400: LOAD r0, [70]',
        '401: MOV r5, 1',
        '402: ADD r0, 1',
        '403: MOV r1, 2',
        '404: MOV r4, r0',
        '405: SUB r4, r1',
        '406: JNZ r4, 409',
        '407: STORE r0, [71]',
        '408: HALT',
        '409: MOV r2, 0',
        '410: MOV r3, 0',
        '411: ADD r2, r1',
        '412: ADD r3, 1',
        '413: MOV r4, r0',
        '414: SUB r4, r2',
        '415: JNZ r4, 417',
        '416: JNZ r5, 402',
        '417: MOV r4, r0',
        '418: SUB r4, r3',
        '419: JNZ r4, 411',
        '420: ADD r1, 1',
        '421: JNZ r5, 404',
      ].join('\n'),
      ['70: 10', '71: 0'].join('\n'),
    )

    const { machine: halted, steps } = runUntilStop(machine)

    expect(halted.status).toBe('halted')
    expect(halted.data[71]).toBe(11)
    expect(halted.executedInstructions).toBe(steps)
    expect(halted.registers.r5).toBe(1)
    expect(steps).toBeGreaterThan(256)
    expect(steps).toBeLessThan(1024)
  })

  it('stops with an execution error when a load references missing data', () => {
    const machine = loadMachine('0: LOAD r0, [40]')

    const errored = stepMachine(machine, 'instruction')

    expect(errored.status).toBe('error')
    expect(errored.phase).toBe('execute')
    expect(errored.statusMessage).toContain('la dirección de datos 40 no está cargada')
    expect(errored.lastTrace).toMatchObject({
      kind: 'instruction',
      title: 'Ciclo interrumpido: LOAD r0, [40]',
    })
  })
})