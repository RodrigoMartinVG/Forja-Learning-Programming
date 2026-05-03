# Salto condicional

Muestra cómo `JNZ` puede sostener un loop corto y deja visible la decisión sobre el `pc` en cada vuelta.

```forja-program
200: LOAD r0, [50]
201: SUB r0, 1
202: JNZ r0, 201
203: HALT
```

```forja-data
50: 3
```