# Indireccion por registro

Muestra direccionamiento indirecto en memoria: `LOAD rX, [rY]` y `STORE rX, [rY]`.

```forja-program
300: MOV r0, 60
301: LOAD r1, [r0]
302: ADD r1, 8
303: MOV r0, 61
304: STORE r1, [r0]
305: HALT
```

```forja-data
60: 34
61: 0
```
