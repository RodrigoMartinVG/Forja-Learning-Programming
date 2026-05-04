# Salto incondicional

Muestra `JMP` saltando sobre instrucciones que nunca se ejecutan, y un `JMP` hacia atrás que arma un loop sin condición acompañado de un `JNZ` que lo cierra.

```forja-program
500: MOV r0, 0
501: JMP 504
502: MOV r0, 99
503: MOV r0, 99
504: ADD r0, 1
505: SUB r1, 0
506: ADD r1, 3
507: SUB r1, 1
508: JNZ r1, 507
509: HALT
```

```forja-data
```
