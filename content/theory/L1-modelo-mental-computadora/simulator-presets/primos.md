# Siguiente primo

Busca el menor número primo estrictamente mayor que el valor de entrada. Usa `r0..r5`, loops anidados y una constante en registro para simular saltos incondicionales con `JNZ`.

```forja-program
400: LOAD r0, [70]
401: MOV r5, 1
402: ADD r0, 1
403: MOV r1, 2
404: MOV r4, r0
405: SUB r4, r1
406: JNZ r4, 409
407: STORE r0, [71]
408: HALT
409: MOV r2, 0
410: MOV r3, 0
411: ADD r2, r1
412: ADD r3, 1
413: MOV r4, r0
414: SUB r4, r2
415: JNZ r4, 417
416: JNZ r5, 402
417: MOV r4, r0
418: SUB r4, r3
419: JNZ r4, 411
420: ADD r1, 1
421: JNZ r5, 404
```

```forja-data
70: 10
71: 0
```