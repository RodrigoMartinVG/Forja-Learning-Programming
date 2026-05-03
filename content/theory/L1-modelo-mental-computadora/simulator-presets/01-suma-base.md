# Suma base

Carga dos datos, los combina y deja el resultado listo para inspección.

```forja-program
100: LOAD r0, [40]
101: ADD r0, [41]
102: STORE r0, [42]
103: HALT
```

```forja-data
40: 7
41: 5
42: 0
```