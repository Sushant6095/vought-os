# Custom Skills · vought:*

Custom skills built specifically for the Vought project. Created via `skill-creator`.

## Planned

- `vought:verify-tokens` — token-drift audit (mirrors `/vought-verify-tokens` slash command)
- `vought:motion-audit` — motion timing audit (mirrors `/vought-motion-audit`)
- `vought:signature-check` — verify the four signature motions are correctly implemented
- `vought:latency-budget` — validate Lighthouse JSON against perf budget
- `vought:speech-engine-status` — health check the entire voice stack

To build a new skill:
1. Plan the skill (input, output, failure modes)
2. Invoke `skill-creator`
3. Test on a known-good and known-bad codebase
4. Document in this README
